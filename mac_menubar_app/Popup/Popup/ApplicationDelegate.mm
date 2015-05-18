#import "ApplicationDelegate.h"


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
    
    /*
    // start http server
    [DDLog addLogger:[DDTTYLogger sharedInstance]];
    
    httpServer = [[HTTPServer alloc] init];
    //[httpServer setInterface:@"localhost"];
    [httpServer setConnectionClass:[Connection class]];
    
    
    NSMutableArray* possiblePorts = [[NSMutableArray alloc] init];
    for( int port = 54620; port < 54626; port++ ){
        [possiblePorts addObject:[NSNumber numberWithInt:port]];
    }
    
    bool connected = false;
    while ( !connected && possiblePorts.count > 0 ) {
        NSNumber * port = [possiblePorts objectAtIndex:0];
        
        [httpServer setPort:[port intValue]];
        [possiblePorts removeObjectAtIndex:0];

        NSError *error = nil;
        if(![httpServer start:&error]) {
            NSLog(@"Error starting HTTP Server: %@", error);
        }
        else{
            NSLog(@"port %i", [httpServer listeningPort]);
            connected = true;
        }
    }
     */
    
    [self performSelectorInBackground:@selector(loopOnStdin) withObject:nil];
    
    

}

#include <iostream>
#include <fstream>
#include <string>
#include <cstdio>

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
            NSString* newStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            
            /*
            NSAlert *alert = [[NSAlert alloc] init];
            [alert setMessageText:newStr];
            [alert runModal];
             */
            
        }
        

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
