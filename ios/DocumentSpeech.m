#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(DocumentSpeech, RCTEventEmitter)

RCT_EXTERN_METHOD(speak:(NSString *)text options:(NSDictionary *)options)
RCT_EXTERN_METHOD(stop)

@end
