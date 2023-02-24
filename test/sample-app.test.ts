import * as cdk from "aws-cdk-lib";
import * as SampleApp from "../lib/sample-app-stack";
import { Template } from "aws-cdk-lib/assertions";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/sample-app-stack.ts
test("SQS Queue Created", () => {
  const app = new cdk.App();
  //     // WHEN
  const stack = new SampleApp.SampleAppStack(app, "MyTestStack");
  //     // THEN
  const template = Template.fromStack(stack);

  //   template.hasResourceProperties('AWS::SQS::Queue', {
  //     VisibilityTimeout: 300
  //   });

  template.hasResource("AWS::S3::Bucket", {});
});
