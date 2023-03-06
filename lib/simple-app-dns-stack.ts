import * as cdk from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
  ICertificate
} from "aws-cdk-lib/aws-certificatemanager";
import { IPublicHostedZone, PublicHostedZone } from "aws-cdk-lib/aws-route53";

interface SimpleAppDnsStackProps extends cdk.StackProps {
  dnsName: string;
}
export class SampleAppDnsStack extends cdk.Stack {
  public readonly hostedZone: IPublicHostedZone;
  public readonly cert: ICertificate;
  constructor(scope: cdk.App, id: string, props: SimpleAppDnsStackProps) {
    super(scope, id, props);

    this.hostedZone = new PublicHostedZone(this, "SampleAppHostedZone", {
      zoneName: props.dnsName
    });

    this.cert = new Certificate(this, "SampleAppCertification", {
      domainName: props.dnsName,
      validation: CertificateValidation.fromDns(this.hostedZone)
    });
  }
}
