#import "ApplicationDelegate.h"

#include <iostream>
#include <fstream>
#include <string>
#include <cstdio>
#include <ctime>

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
    
    
    //[self performSelectorInBackground:@selector(loopOnStdin) withObject:nil];
    [self loopOnStdin];
}



-(NSString*) actOnCommand:(NSString *)command
{
    
    NSString * actionStr = @"";
    
    if( [command isEqualToString:@"init"] ){
        actionStr = @"ok";
    }
    else{
        actionStr = @"uknown";
    }
    
    NSString * responseStr = [NSString stringWithFormat:@"{\"action\":\"%@\"}", actionStr];
    return responseStr;
}

-(void) sendResponse: (NSString*)txt
{
    NSData * nsdata = [txt dataUsingEncoding:NSUTF8StringEncoding];
    char * data = (char*)[nsdata bytes];
    int32_t dataLen = (int) [nsdata length];
    
    std::cout << char(dataLen>>0)
              << char(dataLen>>8)
              << char(dataLen>>16)
              << char(dataLen>>24)
              << data << std::flush;
    /*
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setMessageText:txt];
    [alert runModal];
     */


}
-(void) loopOnStdin
{
    const int len = 1024;
    char buffer[len];
    
    while (fread(buffer, 4, 1, stdin)) {
        int32_t numBytesMsg = 0;
        memcpy(&numBytesMsg, buffer, 4);
        
        char msgBuff[numBytesMsg];
        if( fread(msgBuff, numBytesMsg, 1, stdin) ) {
            NSData * data = [[NSData alloc] initWithBytes:msgBuff length:numBytesMsg];
            //NSString* newStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            
            //NSData * data2 = [newStr dataUsingEncoding:NSUTF8StringEncoding];
            NSError *error;
            NSDictionary *jsonResponse = [NSJSONSerialization JSONObjectWithData:data
                                                                         options:kNilOptions
                                                                           error:&error];
            if( !error ){
                NSString*  cmdStr = jsonResponse[@"cmd"];
                NSString* respStr = [self actOnCommand:cmdStr];
                
                [self sendResponse:respStr];

            }
            /*
            NSAlert *alert = [[NSAlert alloc] init];
            [alert setMessageText:newStr];
            [alert runModal];
             */
            
        }
        //usleep(100);

    }

    
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
