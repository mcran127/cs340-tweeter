import { StatusDto } from "../../dto/StatusDto";
import { TweeterRequest } from "./TweeterRequest";

export interface StatusUserItemRequest extends TweeterRequest{
  readonly token: string;
  readonly lastItem: StatusDto;
}
