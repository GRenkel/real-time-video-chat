import AWS from 'aws-sdk'
import {DetectModerationLabelsResponse, ModerationLabels} from 'aws-sdk/clients/rekognition';

AWS.config.update({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || '',
        secretAccessKey: process.env.SECRET_ACCESS_KEY || ''
    }
});

const rekognition = new AWS.Rekognition();

async function getModerationLabels(frameBuffer: Buffer): Promise<ModerationLabels | []> {
    try {
        const inspection: DetectModerationLabelsResponse = await rekognition.detectModerationLabels({
            Image: {
                Bytes: frameBuffer
            }
        }).promise();
        return inspection.ModerationLabels || []
    } catch (error) {
        console.log('Error getting moderation labels: ', error)
        return []
    }
};

export const RekognitionService = {
    getModerationLabels
}

export type RekognitionServiceType = typeof RekognitionService