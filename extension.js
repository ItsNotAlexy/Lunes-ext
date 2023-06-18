const vscode = require('vscode');
const path = require('path');

function activate(context) {
  let disposable = vscode.commands.registerCommand('lunes.ConfigSftp', async () => {
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
      const Client = require('ssh2-sftp-client');
      const sftp = new Client();

      try {
        await sftp.connect({
          host: sfrpURL,
          port: sfrpPort,
          username: sfrpUser,
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
      const Client = require('ssh2-sftp-client');
      const sftp = new Client();

      try {
        await sftp.connect({
          host: sfrpURL,
          port: sfrpPort,
          username: sfrpUser,
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
        vscode.window.showErrorMessage(error.message);
      } finally {
        await sftp.end();
        vscode.window.showInformationMessage('SFTP Client disconnected successfully! ✨');
      }
    } else {
      vscode.window.showErrorMessage('SFTP Client not configured! 😢');
    }
  });

  context.subscriptions.push(disposable3);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
