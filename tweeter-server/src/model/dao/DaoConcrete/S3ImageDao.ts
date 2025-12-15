import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { Buffer } from "buffer";
import { IImageDao } from "../DaoInterfaces/IImageDao";

export class S3ImageDao implements IImageDao {
  async putImage(
    fileName: string,
    imageStringBase64Encoded: string
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );

    const extension = fileName.split(".").pop()?.toLowerCase() ?? "png";
    const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;

    const s3Params = {
      Bucket: "cs340-images-profile",
      Key: `image/${fileName}`,
      Body: decodedImageBuffer,
      ContentType: contentType,
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    const client = new S3Client({ region: "us-east-1" });
    try {
      await client.send(c);
      return `https://cs340-images-profile.s3.us-east-1.amazonaws.com/image/${fileName}`;
    } catch (error) {
      throw Error("s3 put image failed with: " + error);
    }
  }
}
