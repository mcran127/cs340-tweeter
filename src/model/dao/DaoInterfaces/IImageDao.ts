export interface IImageDao {
    putImage(imageBytesBase64: string, fileExtension: string): Promise<string>;
}
