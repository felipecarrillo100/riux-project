import { GeoJsonCodec } from '@luciad/ria/model/codec/GeoJsonCodec';
import { Codec } from '@luciad/ria/model/codec/Codec';
import { GMLCodec } from '@luciad/ria/model/codec/GMLCodec';

interface CodecRecord {
  codec: Codec;
  uid: string;
  contentTypes: string[];
  fileExtensions: string[];
}

export enum CodecProviderContenTypes {
  GeoJSON = 'application/geo+json',
  GML = 'application/gml+xml',
}

export class CodecProvider {
  private static CodecRecords: CodecRecord[] = [
    {
      codec: GeoJsonCodec as any,
      uid: 'geojson',
      contentTypes: [
        'application/json',
        'application/geo+json',
        'application/ld+json',
        'json',
      ],
      fileExtensions: ['json', 'geojson', 'jsonld'],
    },
    {
      codec: GMLCodec,
      uid: 'gml',
      contentTypes: [
        'application/gml',
        'application/gml+xml',
        'text/xml; subtype=gml',
        'gml',
      ],
      fileExtensions: ['gml', 'gml31', 'gml32'],
    },
  ];

  public static isKnownContentType(contentType: string) {
    const contentRecord = CodecProvider.getCodecRecordByContentType(
      contentType
    );
    return contentRecord ? true : false;
  }

  public static isKnownFileExtension(fileExtention: string) {
    const contentRecord = CodecProvider.getCodecRecordByFileExtension(
      fileExtention
    );
    return contentRecord ? true : false;
  }

  public static getCodecByContentType(contentType: string) {
    const contentRecord = CodecProvider.getCodecRecordByContentType(
      contentType
    );
    return contentRecord ? contentRecord.codec : null;
  }

  public static getCodecByFileExtension(fileExtension: string) {
    const contentRecord = CodecProvider.getCodecRecordByFileExtension(
      fileExtension
    );
    return contentRecord ? contentRecord.codec : null;
  }

  public static getCodecRecordByContentType(contentType: string) {
    const key = contentType.toLowerCase();
    const codecRecord = CodecProvider.CodecRecords.find((item) => {
      // Exact match
      if (item.contentTypes.indexOf(key) > -1) return true;
      // Partial Matches
      if (item.contentTypes.find((ct) => key.startsWith(ct))) {
        return true;
      }
      return false;
    });
    return codecRecord ? codecRecord : null;
  }

  public static getCodecRecordByFileExtension(extension: string) {
    const key = extension.toLowerCase();
    const codecRecord = CodecProvider.CodecRecords.find(
      (item) => item.fileExtensions.indexOf(key) > -1
    );
    return codecRecord ? codecRecord : null;
  }
}
