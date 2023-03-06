#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SampleAppStack } from "../lib/sample-app-stack";
import { SampleAppDnsStack } from "../lib/simple-app-dns-stack";

const app = new cdk.App();
const { hostedZone, cert } = new SampleAppDnsStack(app, "SampleAppDnsStack", {
  dnsName: "max1205-online"
});
const devStage = new SampleAppStack(app, "SampleAppStack", {
  env: { region: "us-east-2" },
  envName: "dev",
  hostedZone,
  cert,
  domain: "max1205-online"
});
const prodStage = new SampleAppStack(app, "SampleAppStack", {
  env: { region: "us-east-1" },
  envName: "dev",
  hostedZone,
  cert,
  domain: "max1205-online"
});
