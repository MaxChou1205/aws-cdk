#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SampleAppStack } from "../lib/sample-app-stack";
import { ServiceStack } from "../lib/service-stack";

const app = new cdk.App();
const devStage = new SampleAppStack(app, "SampleAppStack", {
  env: { region: "us-east-2" },
  envName: "dev"
});
const prodStage = new SampleAppStack(app, "SampleAppStack", {
  env: { region: "us-east-1" },
  envName: "dev"
});
