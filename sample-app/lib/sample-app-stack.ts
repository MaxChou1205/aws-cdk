import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class SampleAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "MySampleAppBucket", {
      encryption: BucketEncryption.S3_MANAGED
    });

    const getPhotos = new NodejsFunction(this, "MySimpleAppLambda", {
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "..", "api", "get-photos", "index.ts"),
      handler: "getPhotos"
    });

    new cdk.CfnOutput(this, "MySimpleAppBucketNameExport", {
      value: bucket.bucketName,
      exportName: "MySimpleAppBucketName"
    });
  }
}
