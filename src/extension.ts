// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as crypto from 'crypto';

// Latex to Unicode dictionary
const latexUnicodeDict: { [key: string]: string } = {
  "==": "⇔",
  "!=": "≠",
  "<=": "\u2264",     // ≤
  ">=": "\u2265",     // ≥
  "\\sum": "\u2211",     // ∑
  "*": "\u00D7",   // ×
  "/": "\u00F7",     // ÷
  "\\neg": "\u00AC",     // ¬
  "\\lambda": "\u03BB"  // λ

  /* "\\alpha": "\u03B1",   // α
  "\\beta": "\u03B2",    // β
  "\\gamma": "\u03B3",   // γ
  "\\delta": "\u03B4",   // δ
  "\\epsilon": "\u03B5", // ε
  "\\zeta": "\u03B6",    // ζ
  "\\eta": "\u03B7",     // η
  "\\theta": "\u03B8",   // θ
  "\\iota": "\u03B9",    // ι
  "\\kappa": "\u03BA",   // κ
  "\\mu": "\u03BC",      // μ
  "\\nu": "\u03BD",      // ν
  "\\xi": "\u03BE",      // ξ
  "\\pi": "\u03C0",      // π
  "\\rho": "\u03C1",     // ρ
  "\\sigma": "\u03C3",   // σ
  "\\tau": "\u03C4",     // τ
  "\\upsilon": "\u03C5", // υ
  "\\phi": "\u03C6",     // φ
  "\\chi": "\u03C7",     // χ
  "\\psi": "\u03C8",     // ψ
  "\\omega": "\u03C9",   // ω
  "\\prod": "\u220F",    // ∏
  "\\int": "\u222B",     // ∫
  "\\infty": "\u221E",   // ∞
  "\\forall": "\u2200",  // ∀
  "\\exists": "\u2203",  // ∃
  "\\in": "\u2208",      // ∈
  "\\notin": "\u2209",   // ∉
  "\\subset": "\u2282",  // ⊂
  "\\supset": "\u2283",  // ⊃
  "\\equiv": "\u2261",   // ≡
  "\\approx": "\u2248",  // ≈
  "\\pm": "\u00B1",      // ± */
};

let oldChecksum = '';

const calculateChecksum = (text: string): string => {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex');
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  
  let onSave: boolean = false;

  vscode.workspace.onDidSaveTextDocument((document) => {
    if (onSave && document.uri.fsPath.endsWith('.lorem')) {
      replaceLatexInFile(document);
    }
  });

  const toggle = vscode.commands.registerCommand('loremscriptum.toggleReplace', () => {	
    onSave = !onSave;
		vscode.window.showInformationMessage('Toggled Latex replacement on save!');
	});


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "loremscriptum" is now active!');

  function replaceLatexInFile(document: vscode.TextDocument) {
    try {
      let fileText = document.getText();
      const checksum = calculateChecksum(fileText);
  
      if (oldChecksum !== checksum) {
        oldChecksum = checksum;
        let updatedText = fileText;
  
        for (const [key, value] of Object.entries(latexUnicodeDict)) {
          const escapedKey = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(escapedKey, 'g');
          updatedText = updatedText.replace(regex, value);
        }
  
        const edit = new vscode.WorkspaceEdit();
        const fullTextRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(fileText.length)
        );
        edit.replace(document.uri, fullTextRange, updatedText);
  
        vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('LaTeX to Unicode transformation applied!');
      }
    } catch (err) {
      console.error('Error while processing the file:', err);
      vscode.window.showErrorMessage('Error occurred while processing the file.');
    }
  }


  

	const latin = vscode.commands.registerCommand('loremscriptum.replaceLatex', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          const document = editor.document;
    
          if (document.uri.fsPath.endsWith('.lorem')) {
            replaceLatexInFile(document);
          } else {
            vscode.window.showInformationMessage('This file is not a .lorem file.');
          }
        } else {
          vscode.window.showInformationMessage('No active editor found!');
        }
    });


    context.subscriptions.push(latin);
    context.subscriptions.push(toggle);  
}

// This method is called when your extension is deactivated
export function deactivate() {}
