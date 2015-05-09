//
//  HTTPCaesuraResponse.m
//  Popup
//
//  Created by Josep on 6/5/15.
//
//

#import <Foundation/Foundation.h>
#import "HTTPCaesuraResponse.h"

@implementation HTTPCaesuraResponse ;


-(id) initWithStatus: (int) status
{
    if ((self = [super init]))
    {
        _status = status;
    }
    
    return self;

    
}

- (UInt64) contentLength {
    return 0;
}

- (UInt64) offset {
    return 0;
}

- (void)setOffset:(UInt64)offset {
    ;
}

- (NSData*) readDataOfLength:(NSUInteger)length {
    return nil;
}

- (BOOL) isDone {
    return YES;
}

- (NSInteger) status {
    return _status;
}

@end