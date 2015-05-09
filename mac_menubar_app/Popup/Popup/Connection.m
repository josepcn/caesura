#import "Connection.h"
#import "HTTPMessage.h"
#import "HTTPLogging.h"
#import "HTTPCaesuraResponse.h"

// Log levels : off, error, warn, info, verbose
// Other flags: trace
static const int httpLogLevel = HTTP_LOG_LEVEL_VERBOSE | HTTP_LOG_FLAG_TRACE;


/**
 * All we have to do is override appropriate methods in HTTPConnection.
 **/

@implementation Connection




- (NSObject<HTTPResponse> *)httpResponseForMethod:(NSString *)method URI:(NSString *)path
{
    HTTPLogTrace();
    
    if ([method isEqualToString:@"GET"] && [path isEqualToString:@"/query/"])
    {
        //HTTPLogVerbose(@"%@[%p]: postContentLength: %qu", THIS_FILE, self, requestContentLength);
        
        HTTPLogVerbose(@"Have been polled");
        
        return [[HTTPCaesuraResponse alloc] init];
    }
    
    return [super httpResponseForMethod:method URI:path];
}




@end