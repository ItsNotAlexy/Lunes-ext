const vscode = require('vscode');
const axios = require('axios');

function activate(context) {
    let disposable = vscode.commands.registerCommand('lunes.Config', async () => {
        const apiKey = await vscode.window.showInputBox({
            placeHolder: "API Key",
            prompt: "Enter your API Key",
            value: context.workspaceState.get("lunes.apiKey", "")
        });
        const serverID = await vscode.window.showInputBox({
            placeHolder: "Server ID",
            prompt: "Enter your Server ID",
            value: context.workspaceState.get("lunes.serverID", "")
        });

        if (apiKey && serverID) {
            context.workspaceState.update("lunes.apiKey", apiKey);
            context.workspaceState.update("lunes.serverID", serverID);
            vscode.window.showInformationMessage("Configuration saved successfully!");
        } else {
            vscode.window.showErrorMessage("Please enter your API Key and Server ID");
        }
    });

    context.subscriptions.push(disposable);
    
    vscode.workspace.onDidSaveTextDocument(document => {
        const KeyIsExist = context.workspaceState.get("lunes.apiKey");
        const ServerIDIsExist = context.workspaceState.get("lunes.serverID");
        if (KeyIsExist && ServerIDIsExist) {
            if (document.uri.scheme === "file") {
                const fileName = vscode.workspace.asRelativePath(document.uri);
                const fileExtension = fileName.split('.').pop();
                vscode.window.showInformationMessage(`Saved: ${fileName} (${fileExtension})`);

                const URL = `https://ctrl.lunes.host/api/client/servers/${ServerIDIsExist}/files/write?file=${fileName}`;
                const RequestHeaders = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${KeyIsExist}`
                };
                const codeContent = document.getText();

                const FormatingInfo = vscode.window.showInformationMessage("Formatting code...");

                setTimeout(() => {
                    FormatingInfo.dispose();
                }, 1000);
                
                const formattedCode = codeContent.replace(/"/g, '').replace(/\n/g, '\n    ');
                const indentedCode = `    ${formattedCode}`;
                const RequestBody = indentedCode;

                axios.post(URL, RequestBody, { headers: RequestHeaders })
                    .then(response => {
                        if (response.data.error) {
                            vscode.window.showErrorMessage(response.data.error);
                        } else {
                            vscode.window.showInformationMessage("File saved successfully!");
                        }
                    })
                    .catch(error => {
                        vscode.window.showErrorMessage(error.message);
                    });
            }
        } else {
            vscode.window.showErrorMessage("Please enter your API Key and Server ID");
        }
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
