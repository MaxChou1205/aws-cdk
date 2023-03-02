import { S3 } from "aws-sdk";

const bucketName = process.env.PHOTO_BUCKET_NAME!;
const s3 = new S3();

import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

async function generateUrl(
  object: S3.Object
): Promise<{ filename: string; url: string }> {
  const url = await s3.getSignedUrlPromise("getObject", {
    Bucket: bucketName,
    Key: object.Key!,
    Expires: 24 * 60 * 60
  });
  return {
    filename: object.Key!,
    url
  };
}

async function getPhotos(
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  try {
    const { Contents: results } = await s3
      .listObjects({ Bucket: bucketName })
      .promise();
    const photos = await Promise.all(
      results!.map(result => generateUrl(result))
    );
    return {
      statusCode: 200,
      body: JSON.stringify(photos)
    };
  } catch (err: any) {
    return { statusCode: 500, body: err.message };
  }
}

export { getPhotos };
