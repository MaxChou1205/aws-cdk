import { S3 } from "aws-sdk";

const bucketName = process.env.PHOTO_BUCKET_NAME;
const s3 = new S3();

import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

async function getPhotos(
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    body: "Hello from the lambda. get the bucket name: " + bucketName
  };
}

export { getPhotos };
