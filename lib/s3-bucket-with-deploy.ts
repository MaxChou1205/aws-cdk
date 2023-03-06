import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

interface S3BucketWithDeployProps extends cdk.StackProps {
  // deployTo: string[];
  encryption: s3.BucketEncryption;
}

export class S3BucketWithDeploy extends cdk.Stack {
  public readonly bucket: s3.IBucket;
  constructor(scope: cdk.App, id: string, props: S3BucketWithDeployProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "MySampleAppBucket", {
      encryption: props.encryption
    });

    new BucketDeployment(this, "MySampleAppPhotos", {
      sources: [Source.asset("photos")],
      destinationBucket: this.bucket
      // destinationKeyPrefix: "web/static" // optional prefix in destination bucket
    });
  }
}
