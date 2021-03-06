#import "ApplicationDelegate.h"

#include <iostream>
#include <fstream>
#include <string>
#include <cstdio>
#include <ctime>
#include <string>

@implementation ApplicationDelegate

@synthesize panelController = _panelController;
@synthesize menubarController = _menubarController;

#pragma mark -

- (void)dealloc
{
    [_panelController removeObserver:self forKeyPath:@"hasActivePanel"];
}

#pragma mark -

void *kContextActivePanel = &kContextActivePanel;

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    if (context == kContextActivePanel) {
        self.menubarController.hasActiveIcon = self.panelController.hasActivePanel;
    }
    else {
        [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    }
}

#pragma mark - NSApplicationDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
    // Install icon into the menu bar
    self.menubarController = [[MenubarController alloc] init];

    [self performSelectorInBackground:@selector(loopOnStdin) withObject:nil];
}


-(void) showDebugAlert: (NSString *) text
{
    
     NSAlert *alert = [[NSAlert alloc] init];
     [alert setMessageText:text];
     [alert runModal];
    

}

-(NSString*) buildActionResponseStr: (NSString *)actionStr
{
    return [NSString stringWithFormat:@"{\"action\":\"%@\"}", actionStr];
    
}

-(NSString*) actOnCommand:(NSString *)command
{
    
    NSString * actionStr = @"";
    
    if( [command isEqualToString:@"init"] ){
        actionStr = @"ok";
    }
    else if( [command isEqualToString:@"debug"] ){
        actionStr = @"debug";
    }
    else{
        actionStr = @"uknown";
    }
    
    return [self buildActionResponseStr:actionStr];
}


-(void) sendResponse: (NSString*)txt
{
    
    const char * utfBuff = [txt UTF8String];
    int32_t dataLen = (int32_t)strlen(utfBuff);
    
    std::cout << Byte(dataLen>>0)
    << Byte(dataLen>>8)
    << Byte(dataLen>>16)
    << Byte(dataLen>>24)
    << utfBuff << std::flush;
}


-(void) loopOnStdin
{
    Byte buffer[4];
    
    while (fread(buffer, 4, 1, stdin)) {
        
        //NSLog( @"got data on stdin" );
        
        int32_t numBytesMsg = 0;
        
        numBytesMsg = (numBytesMsg << 8) + buffer[3];
        numBytesMsg = (numBytesMsg << 8) + buffer[2];
        numBytesMsg = (numBytesMsg << 8) + buffer[1];
        numBytesMsg = (numBytesMsg << 8) + buffer[0];
        
        char msgBuff[numBytesMsg];
        if( fread(msgBuff, numBytesMsg, 1, stdin) ) {
            NSData * data = [[NSData alloc] initWithBytes:msgBuff length:numBytesMsg];
            
            NSError *error;
            NSDictionary *jsonResponse = [NSJSONSerialization JSONObjectWithData:data
                                                                         options:kNilOptions
                                                                           error:&error];
            if( !error ){
                NSString*  cmdStr = jsonResponse[@"cmd"];
                NSString* respStr = [self actOnCommand:cmdStr];
                [self sendResponse:respStr];
            }
        }
    }

    //NSLog( @"terminating" );

    // terminate if we cannot read from stdin (extension was closed)
    [NSApp terminate:self];
}

- (NSApplicationTerminateReply)applicationShouldTerminate:(NSApplication *)sender
{
    // Explicitly remove the icon from the menu bar
    self.menubarController = nil;
    return NSTerminateNow;
}

#pragma mark - Actions

- (IBAction)togglePanel:(id)sender
{
    //self.menubarController.hasActiveIcon = !self.menubarController.hasActiveIcon;
    //self.panelController.hasActivePanel = self.menubarController.hasActiveIcon;
    
    [self sendResponse:[self buildActionResponseStr:@"toogle"]];
}

#pragma mark - Public accessors

- (PanelController *)panelController
{
    if (_panelController == nil) {
        _panelController = [[PanelController alloc] initWithDelegate:self];
        [_panelController addObserver:self forKeyPath:@"hasActivePanel" options:0 context:kContextActivePanel];
    }
    return _panelController;
}

#pragma mark - PanelControllerDelegate

- (StatusItemView *)statusItemViewForPanelController:(PanelController *)controller
{
    return self.menubarController.statusItemView;
}

@end
