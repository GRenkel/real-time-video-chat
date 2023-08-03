import { Rekognition } from "aws-sdk";
import {RekognitionServiceType} from "../apis/awsRekognition";


export class FrameInspector {
    constructor(private inspector : RekognitionServiceType) {}

    decodeFrame(frame : string): Buffer {
        return Buffer.from(frame, 'base64');
    }

    async inspectFrame(frameString : string) {
        try {
            let frameBuffer : Buffer = this.decodeFrame(frameString);
            const moderationLabels : Rekognition.ModerationLabels = await this.inspector.getModerationLabels(frameBuffer)
            console.log('Inspection result: ', moderationLabels)
            return moderationLabels
        } catch (error) {
            console.error('Error inspecting frame', error)
        }
    }
}
