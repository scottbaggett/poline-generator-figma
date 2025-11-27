// This file runs in the Figma plugin sandbox
// It can access the Figma API but not the DOM

// @ts-ignore - __html__ is provided by Figma at runtime
figma.showUI(__html__, {
  width: 1200,
  height: 840,
  themeColors: true
});

// Helper function to get style name based on config
function getStyleName(
  index: number,
  total: number,
  prefix: string,
  namingPattern: 'numeric' | 'tailwind' | 'custom',
  customNames?: string[]
): string {
  let name: string;
  
  if (namingPattern === 'tailwind') {
    if (index === 0) {
      name = '50';
    } else if (index === total - 1) {
      name = '950';
    } else {
      name = `${Math.round((index / (total - 1)) * 900)}`;
    }
  } else if (namingPattern === 'custom' && customNames && customNames[index]) {
    name = customNames[index];
  } else {
    name = `${index + 1}`;
  }
  
  return prefix ? `${prefix}/${name}` : name;
}

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-color-styles') {
    const { colors, config } = msg;
    
    try {
      const prefix = config?.prefix || 'Poline';
      const namingPattern = config?.namingPattern || 'numeric';
      const createVariables = config?.createVariables || false;
      const customNames = config?.customNames;
      
      const createdStyles: string[] = [];
      
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const hex = color.hex;
        
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const styleName = getStyleName(i, colors.length, prefix, namingPattern, customNames);
        
        if (createVariables) {
          // Create a color variable
          let collection = figma.variables.getLocalVariableCollections()[0];
          if (!collection) {
            collection = figma.variables.createVariableCollection('Colors');
          }
          
          const variable = figma.variables.createVariable(styleName, collection, 'COLOR');
          const modeId = collection.modes[0].modeId;
          variable.setValueForMode(modeId, { r, g, b });
          createdStyles.push(styleName);
        } else {
          // Create paint style
          const style = figma.createPaintStyle();
          style.name = styleName;
          style.paints = [{
            type: 'SOLID',
            color: { r, g, b }
          }];
          createdStyles.push(style.name);
        }
      }
      
      const styleType = createVariables ? 'variables' : 'styles';
      figma.notify(`Created ${createdStyles.length} color ${styleType}!`);
      figma.ui.postMessage({ 
        type: 'styles-created', 
        styles: createdStyles 
      });
    } catch (error) {
      figma.notify(`Error creating styles: ${error}`, { error: true });
      figma.ui.postMessage({ 
        type: 'error', 
        message: String(error) 
      });
    }
  }
  
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

