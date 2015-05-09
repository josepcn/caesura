#import "MenubarController.h"
#import "PanelController.h"
#import "HTTPServer.h"

@interface ApplicationDelegate : NSObject <NSApplicationDelegate, PanelControllerDelegate>{
    HTTPServer * httpServer;
}

@property (nonatomic, strong) MenubarController *menubarController;
@property (nonatomic, strong, readonly) PanelController *panelController;

- (IBAction)togglePanel:(id)sender;

@end
