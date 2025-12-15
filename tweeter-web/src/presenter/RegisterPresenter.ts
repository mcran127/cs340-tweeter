import { Buffer } from "buffer";
import { AuthenticationPresenter } from "./AuthenticationPresenter";
import { User } from "tweeter-shared";

export class RegisterPresenter extends AuthenticationPresenter {
  private _imageUrl: string = "";
  private _imageBytes: Uint8Array = new Uint8Array();
  private _imageFileExtension: string = "";

  public get imageUrl(): string {
    return this._imageUrl;
  }

  public get imageBytes(): Uint8Array {
    return this._imageBytes;
  }

  public get imageFileExtension(): string {
    return this._imageFileExtension;
  }

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) {
    await this.AuthenticationFlow(
      () => {
        return this.userService.register(
          firstName,
          lastName,
          alias,
          password,
          imageBytes,
          imageFileExtension
        );
      },
      (user: User) => {
        this.view.navigate(`/feed/${user.alias}`);
      },
      rememberMe,
      this.errorDescription()
    );
  }

  public handleImageFile = (file: File | undefined) => {
    if (file) {
      this._imageUrl = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this._imageBytes = bytes;
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this._imageFileExtension = fileExtension;
      }
    } else {
      this._imageUrl = "";
      this._imageBytes = new Uint8Array();
    }
  };

  private getFileExtension = (file: File): string | undefined => {
    return file.name.split(".").pop();
  };

  protected errorDescription(): string {
    return "register user";
  }
}
