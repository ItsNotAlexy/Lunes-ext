const vscode = require('vscode');
const path = require('path');
const Client = require('ssh2-sftp-client');
const sftp = new Client();
const axios = require('axios');


function activate(context) {
  const disposable = vscode.commands.registerCommand('lunes.ConfigSftp', async () => {
    const sftpurl = await vscode.window.showInputBox({
      placeHolder: 'node.example.com',
      prompt: 'Enter SFTP URL',
      value: context.workspaceState.get('lunes.sftpurl', ''),
    });

    const sftpport = await vscode.window.showInputBox({
      placeHolder: '2022',
      prompt: 'Enter SFTP Port',
      value: context.workspaceState.get('lunes.sftpport', ''),
    });

    const sftpuser = await vscode.window.showInputBox({
      placeHolder: 'username',
      prompt: 'Enter SFTP Username',
      value: context.workspaceState.get('lunes.sftpuser', ''),
    });

    const sftpass = await vscode.window.showInputBox({
      placeHolder: 'password',
      prompt: 'Enter SFTP Password',
      value: context.workspaceState.get('lunes.sftpass', ''),
    });

    if (sftpurl && sftpport && sftpuser && sftpass) {
      context.workspaceState.update('lunes.sftpurl', sftpurl);
      context.workspaceState.update('lunes.sftpport', sftpport);
      context.workspaceState.update('lunes.sftpuser', sftpuser);
      context.workspaceState.update('lunes.sftpass', sftpass);

      vscode.window.showInformationMessage('SFTP Client configured successfully! 🚀');
    } else {
      vscode.window.showErrorMessage('SFTP Client configuration failed! 😢')
    }
  });

  context.subscriptions.push(disposable);

  const disposable2 = vscode.commands.registerCommand('lunes.UploadFile', async () => {
    const sfrpURL = context.workspaceState.get('lunes.sftpurl', '');
    const sfrpPort = context.workspaceState.get('lunes.sftpport', '');
    const sfrpUser = context.workspaceState.get('lunes.sftpuser', '');
    const sfrpPass = context.workspaceState.get('lunes.sftpass', '');

    if (sfrpURL && sfrpPort && sfrpUser && sfrpPass) {
      const ServerId = context.workspaceState.get('lunes.serverId', '');
      const FormatUser = sfrpUser + '.' + ServerId;

      vscode.window.showInformationMessage(`SFTP Client connecting with ${FormatUser} 🚀`);
      
      try {
        await sftp.connect({
          host: sfrpURL,
          port: sfrpPort,
          username: FormatUser,
          password: sfrpPass
        });

        vscode.window.showInformationMessage('SFTP Client connected successfully! 🚀');

        const fileChoices = await vscode.window.showQuickPick(
          vscode.workspace.textDocuments.map((doc) => path.basename(doc.fileName)),
          { placeHolder: 'Select a file to upload' }
        );

        if (!fileChoices) {
          vscode.window.showErrorMessage('Upload Aborted! ⚠');
          return;
        }

        const selectedDocument = vscode.workspace.textDocuments.find((doc) => path.basename(doc.fileName) === fileChoices);
        if (!selectedDocument) {
          vscode.window.showErrorMessage('No file selected! ⚠');
          return;
        }

        const localPath = selectedDocument.uri.fsPath;
        const remoteFilePath = `/${path.basename(localPath)}`;

        await sftp.put(localPath, remoteFilePath);
        vscode.window.showInformationMessage('File uploaded successfully! 📤');
      } catch (error) {
        vscode.window.showErrorMessage(error.message);
      } finally {
        await sftp.end();
        vscode.window.showInformationMessage('SFTP Client disconnected successfully! ✨');
      }
    } else {
      vscode.window.showErrorMessage('SFTP Client not configured! 😢');
    }
  });

  context.subscriptions.push(disposable2);

  const disposable3 = vscode.commands.registerCommand('lunes.DownloadFile', async () => {
    const sfrpURL = context.workspaceState.get('lunes.sftpurl', '');
    const sfrpPort = context.workspaceState.get('lunes.sftpport', '');
    const sfrpUser = context.workspaceState.get('lunes.sftpuser', '');
    const sfrpPass = context.workspaceState.get('lunes.sftpass', '');

    if (sfrpURL && sfrpPort && sfrpUser && sfrpPass) {
      try {
        const ServerId = context.workspaceState.get('lunes.serverId', '');
        const FormatUser = sfrpUser + '.' + ServerId;

        vscode.window.showInformationMessage(`SFTP Client connecting with ${FormatUser} 🚀`);

        await sftp.connect({
          host: sfrpURL,
          port: sfrpPort,
          username: FormatUser,
          password: sfrpPass
        });

        vscode.window.showInformationMessage('SFTP Client connected successfully! 🚀');

        const fileChoices = await sftp.list('/');

        if (!fileChoices || fileChoices.length === 0) {
          vscode.window.showErrorMessage('No files available for download! ⚠');
          return;
        }

        const fileMap = fileChoices.reduce((map, file) => {
          map[file.name] = file;
          return map;
        }, {});

        const fileNames = Object.keys(fileMap);

        const selectedFileName = await vscode.window.showQuickPick(fileNames, {
          placeHolder: 'Select a file to download',
        });

        if (!selectedFileName) {
          vscode.window.showErrorMessage('Download Aborted! ⚠');
          return;
        }

        const selectedFile = fileMap[selectedFileName];

        const localPath = vscode.workspace.rootPath + '/' + selectedFile.name;
        const remoteFilePath = `/${selectedFile.name}`;

        await sftp.get(remoteFilePath, localPath);
        vscode.window.showInformationMessage('File downloaded successfully! 📥');
      } catch (error) {
        vscode.window.showErrorMessage(error.message + "Attempted Host: " + sfrpURL);
      } finally {
        await sftp.end();
        vscode.window.showInformationMessage('SFTP Client disconnected successfully! ✨');
      }
    } else {
      vscode.window.showErrorMessage('SFTP Client not configured! 😢');
    }
  });

  context.subscriptions.push(disposable3);

  const disposable4 = vscode.commands.registerCommand('lunes.StartListen', async () => {
    const sfrpURL = context.workspaceState.get('lunes.sftpurl', '');
    const sfrpPort = context.workspaceState.get('lunes.sftpport', '');
    const sfrpUser = context.workspaceState.get('lunes.sftpuser', '');
    const sfrpPass = context.workspaceState.get('lunes.sftpass', '');
  
    if (sfrpURL && sfrpPort && sfrpUser && sfrpPass) {
      let OnChangeFileEvent = context.workspaceState.get('lunes.OnChangeFileEvent', '');
  
      if (!OnChangeFileEvent) {
        OnChangeFileEvent = 'false';
      }
  
      if (OnChangeFileEvent === 'true') {
        vscode.window.showErrorMessage('SFTP Client turned off! ✅');
        context.workspaceState.update('lunes.OnChangeFileEvent', 'false');
      } else {
        vscode.window.showInformationMessage('SFTP Client turned on! 🚀');
        context.workspaceState.update('lunes.OnChangeFileEvent', 'true');
      }
    } else {
      vscode.window.showErrorMessage('SFTP Client not configured! 😢');
    }
  });
  
  context.subscriptions.push(disposable4);
  

  const disposable5 = vscode.commands.registerCommand('lunes.EndListen', async () => {
    let SFTPOnChange = context.workspaceState.get('lunes.OnChangeFileEvent', '');
  
    if (!SFTPOnChange) {
      SFTPOnChange = 'false';
    }
  
    if (SFTPOnChange === 'true') {
      context.workspaceState.update('lunes.OnChangeFileEvent', 'false');
      vscode.window.showInformationMessage('SFTP Client turned off! ✅');
    } else {
      vscode.window.showErrorMessage('SFTP Client already turned off! ❌');
    }
  });
  
  context.subscriptions.push(disposable5);

  const disposable6 = vscode.commands.registerCommand('lunes.Auth', async () => {
    const email = await vscode.window.showInputBox({
      placeHolder: 'Enter your email',
      prompt: 'Enter your email',
    });
  
    const api_key = await vscode.window.showInputBox({
      placeHolder: 'Enter your api key',
      prompt: 'Enter your api key',
    });
  
    const RequestURL = 'https://ctrl.lunes.host/api/client/account';
  
    const Headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + api_key,
    };
  
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Authenticating...',
        cancellable: false,
      },
      async (progress, token) => {
        try {
          const response = await axios.get(RequestURL, { headers: Headers });
          const data = response.data;
          const userEmail = data['attributes']['email'];
  
          if (userEmail === email) {
            context.workspaceState.update('lunes.authKey', api_key);
            context.workspaceState.update('lunesAuthEmail', email);
            context.workspaceState.update('lunes.authStatus', 'true');
            vscode.window.showInformationMessage('User authenticated successfully! 🚀');
          } else {
            vscode.window.showInformationMessage('Invalid credentials, Try again! ⚠');
          }
        } catch (error) {
          vscode.window.showErrorMessage('Error: ' + error.message);
        }
      }
    );
  });
  
  context.subscriptions.push(disposable6);

  const disposable7 = vscode.commands.registerCommand('lunes.SwitchServer', async () => {
    const authStatus = context.workspaceState.get('lunes.authStatus', '');
    const authKey = context.workspaceState.get('lunes.authKey', '');
  
    if (authStatus === 'true' && authKey) {
      const URL = 'https://ctrl.lunes.host/api/client/';
      const Headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + authKey,
      };
  
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Fetching servers...',
          cancellable: false,
        },
        async (progress, token) => {
          try {
            const response = await axios.get(URL, { headers: Headers });
            const data = response.data;
            const servers = data['data'];
            const serverNames = [];
            const serverIds = [];
            const serverNodes = [];
  
            servers.forEach((server) => {
              serverNames.push(server['attributes']['name']);
              serverIds.push(server['attributes']['identifier']);
              serverNodes.push(server['attributes']['node']);
            });
  
            const selectedServer = await vscode.window.showQuickPick(serverNames, {
              placeHolder: 'Select a server',
            });
  
            if (selectedServer) {
              const selectedServerId = serverIds[serverNames.indexOf(selectedServer)];
              const serverNode = serverNodes[serverNames.indexOf(selectedServer)].trim();
              const reformattedNodeURL = serverNode.toLowerCase().replace(/\s/g, '') + '.lunes.host';

              context.workspaceState.update('lunes.serverId', selectedServerId);
              context.workspaceState.update('lunes.sftpurl', reformattedNodeURL);
              vscode.window.showInformationMessage(`Server switched to ${selectedServerId}! 🚀`);
            }
          } catch (error) {
            vscode.window.showErrorMessage('Error: ' + error.message);
          }
        }
      );
    } else {
      vscode.window.showErrorMessage('User not authenticated, please login first! ⚠');
    }
  });
  
  context.subscriptions.push(disposable7);

  const disposable8 = vscode.commands.registerCommand('lunes.DownloadServer', async () => {
    const sfrpURL = context.workspaceState.get('lunes.sftpurl', '');
    const sfrpPort = context.workspaceState.get('lunes.sftpport', '');
    const sfrpUser = context.workspaceState.get('lunes.sftpuser', '');
    const sfrpPass = context.workspaceState.get('lunes.sftpass', '');
    const serverId = context.workspaceState.get('lunes.serverId', '');

    const ReformatUser = sfrpUser + '.' + serverId;

    try {
      await sftp.connect({
        host: sfrpURL,
        port: sfrpPort,
        username: ReformatUser,
        password: sfrpPass,
      });

      const files = await sftp.list(remoteFolderPath, false);
  
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Downloading files... ✨',
          cancellable: false,
        },
        async (progress) => {
          const localFolderPath = vscode.workspace.rootPath;
          const remoteFolderPath = '/';
          for (const file of files) {
            const remoteFilePath = path.join(remoteFolderPath, file.name);
            const localFilePath = path.join(localFolderPath, file.name);
  
            if (file.type === 'd') {
              fs.mkdirSync(localFilePath, { recursive: true });
            } else {
              await sftp.get(remoteFilePath, localFilePath);
            }
  
            progress.report({ message: `Downloading: ${file.name} ⏱` });
          }
  
          vscode.window.showInformationMessage('Download completed! ✅');
        }
      );
    } catch (error) {
      vscode.window.showErrorMessage('Error: ' + error.message);
    } finally {
      sftp.end();
      vscode.window.showInformationMessage('Disconnected from the server successfully! 🚀');
    }
  });
  
  context.subscriptions.push(disposable8);

  // Events

  const OnSaveEvent = vscode.workspace.onDidSaveTextDocument(async (document) => {
    const sfrpURL = context.workspaceState.get('lunes.sftpurl', '');
    const sfrpPort = context.workspaceState.get('lunes.sftpport', '');
    const sfrpUser = context.workspaceState.get('lunes.sftpuser', '');
    const sfrpPass = context.workspaceState.get('lunes.sftpass', '');
    const OnChangeFileEvent = context.workspaceState.get('lunes.OnChangeFileEvent', '');
  
    if (sfrpURL && sfrpPort && sfrpUser && sfrpPass && OnChangeFileEvent === 'true') {
      try {
        await sftp.connect({
          host: sfrpURL,
          port: sfrpPort,
          username: sfrpUser,
          password: sfrpPass
        });
  
        const localPath = document.uri.fsPath;
        const remoteFilePath = `/${path.basename(localPath)}`;
  
        await sftp.put(localPath, remoteFilePath);
        vscode.window.showInformationMessage('File uploaded successfully! 📤');
      } catch (error) {
        vscode.window.showErrorMessage(error.message);
      } finally {
        await sftp.end();
      }
    } else if (OnChangeFileEvent !== 'true') {
      return;
    }
  });
  
  context.subscriptions.push(OnSaveEvent);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
