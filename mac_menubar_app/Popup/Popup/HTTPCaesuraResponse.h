
#import <Foundation/Foundation.h>
#import "HTTPResponse.h"

@interface HTTPCaesuraResponse : NSObject <HTTPResponse> {
    NSInteger _status;
}

-(id) initWithStatus: (int) status;

@end
