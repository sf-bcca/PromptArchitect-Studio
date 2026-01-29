const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];
const rootDir = process.cwd();
const componentsDir = path.join(rootDir, 'components');

if (!componentName) {
  console.error("Error: Missing component name.");
  console.log("Usage: node create_component.cjs <ComponentName>");
  process.exit(1);
}

// Ensure first letter is capitalized
const safeName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

const componentPath = path.join(componentsDir, `${safeName}.tsx`);
const testPath = path.join(componentsDir, `${safeName}.test.tsx`);

if (fs.existsSync(componentPath)) {
  console.error(`Error: Component '${safeName}' already exists.`);
  process.exit(1);
}

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// React Component Template
const componentTemplate = `import React from 'react';

interface ${safeName}Props {
  // Define props here
  title?: string;
}

export const ${safeName}: React.FC<${safeName}Props> = ({ title = '${safeName}' }) => {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl" aria-label="${safeName}">
      <h2 className="text-xl font-bold text-gray-100">{title}</h2>
      <p className="text-gray-400 mt-2">Component content goes here.</p>
    </div>
  );
};
`;

// Vitest Template
const testTemplate = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${safeName} } from './${safeName}';

describe('${safeName} Component', () => {
  it('renders successfully', () => {
    render(<${safeName} />);
    const element = screen.getByLabelText('${safeName}');
    expect(element).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<${safeName} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
});
`;

fs.writeFileSync(componentPath, componentTemplate);
fs.writeFileSync(testPath, testTemplate);

console.log(`✅ Created Component: ${componentPath}`);
console.log(`✅ Created Test: ${testPath}`);
