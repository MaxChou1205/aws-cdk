import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Artifact } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  GitHubSourceAction
} from "aws-cdk-lib/aws-codepipeline-actions";
import { SecretValue } from "aws-cdk-lib";
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject
} from "aws-cdk-lib/aws-codebuild";

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

    const pipeline = new cdk.aws_codepipeline.Pipeline(
      this,
      "MyFirstPipeline",
      {
        pipelineName: "sampleAppPipeline"
      }
    );

    const sourceOutput = new Artifact("SourceOutput");
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new GitHubSourceAction({
          actionName: "Pipeline_Source",
          owner: "MaxChou1205",
          repo: "aws-cdk",
          branch: "master",
          oauthToken: SecretValue.secretsManager("github-pipeline-token"),
          output: sourceOutput
        })
      ]
    });

    const cdkBuildOutput = new Artifact("CdkBuildOutput");
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "CDK_Build",
          input: sourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, "CdkBuildProject", {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_6_0
            },
            buildSpec: BuildSpec.fromSourceFilename(
              "build-specs/cdk-build-spec.yml"
            )
          })
        })
      ]
    });

    new cdk.CfnOutput(this, "MySimpleAppBucketNameExport", {
      value: bucket.bucketName,
      exportName: "MySimpleAppBucketName"
    });
  }
}
