import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { S3BucketWithDeploy } from "./s3-bucket-with-deploy";

interface SimpleAppStackProps extends cdk.StackProps {
  envName: string;
  hostedZone: route53.IPublicHostedZone;
  cert: ICertificate;
  domain: string;
}
export class SampleAppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: SimpleAppStackProps) {
    super(scope, id, props);

    const { bucket } = new S3BucketWithDeploy(scope, "MySampleAppBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    const websiteBucket = new s3.Bucket(this, "MySampleWebsiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "MySampleWebsiteBucketAccessIdentity"
    );
    websiteBucket.grantRead(originAccessIdentity);

    const cf = new cloudfront.Distribution(this, "MySampleDistribution", {
      domainNames: [props.domain],
      certificate: props.cert,
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(websiteBucket, {
          originAccessIdentity: originAccessIdentity
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      errorResponses: [
        {
          httpStatus: 403,
          ttl: cdk.Duration.seconds(60),
          responsePagePath: "/index.html",
          responseHttpStatus: 200
        },
        {
          httpStatus: 404,
          ttl: cdk.Duration.seconds(60),
          responsePagePath: "/index.html",
          responseHttpStatus: 200
        }
      ]
    });

    new route53.ARecord(this, "SampleAppARecord", {
      zone: props.hostedZone,
      target: route53.RecordTarget.fromAlias(new CloudFrontTarget(cf))
    });
    // const recordSet = new route53.CfnRecordSet(this, "SampleAppARecord" + idx, {
    //   hostedZoneName: props.hostedName,
    //   name: props.domain,
    //   type: "A",
    //   aliasTarget: {
    //     dnsName: cf.distributionDomainName,
    //     hostedZoneId: "Z2FDTNDATAQYW2" //https://stackoverflow.com/questions/39665214/get-hosted-zone-for-cloudfront-distribution
    //   }
    // });

    new s3_deployment.BucketDeployment(this, "MySampleWebsite", {
      sources: [s3_deployment.Source.asset("frontend/dist")],
      destinationBucket: websiteBucket,
      distribution: cf
    });

    const getPhotos = new NodejsFunction(this, "MySimpleAppLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getPhotos",
      entry: path.join(__dirname, "..", "api", "get-photos", "index.ts"),
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName
      }
    });

    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions("s3:ListBucket");

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions("s3:GetObject", "s3:PutObject");

    getPhotos.addToRolePolicy(bucketPermissions);
    getPhotos.addToRolePolicy(bucketContainerPermissions);

    const api = new apigateway.LambdaRestApi(this, "Endpoint", {
      handler: getPhotos,
      proxy: false
    });
    const route = api.root.addResource("getAllPhotos");
    route.addMethod("GET");
  }
}
