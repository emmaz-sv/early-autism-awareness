import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Helper to load and prepare the HTML (stripping Jekyll front matter)
function loadScreenerHTML(filePath) {
  const absolutePath = path.resolve(__dirname, '..', filePath);
  let fileContent = fs.readFileSync(absolutePath, 'utf8');
  
  // Strip Jekyll front matter if present (starts and ends with ---)
  if (fileContent.startsWith('---')) {
    const parts = fileContent.split('---');
    // The content is everything after the second '---'
    fileContent = parts.slice(2).join('---');
  }
  
  return fileContent;
}

describe('M-CHAT-R Screener - English Page Integration Tests', () => {
  const html = loadScreenerHTML('docs/screening.html');

  const setupDOM = () => {
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    const { window } = dom;
    const { document } = window;
    return { window, document };
  };

  it('should initialize with the start view visible and quiz/results hidden', () => {
    const { document } = setupDOM();
    expect(document.getElementById('start-view').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('quiz-view').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('results-view').classList.contains('hidden')).toBe(true);
  });

  it('should show age warning when selecting outside 16-30 months', () => {
    const { document } = setupDOM();
    const ageSelect = document.getElementById('child-age');
    const warning = document.getElementById('age-warning');
    
    expect(warning.classList.contains('hidden')).toBe(true);
    
    // Select other age group
    ageSelect.value = 'other';
    ageSelect.dispatchEvent(new document.defaultView.Event('change'));
    
    expect(warning.classList.contains('hidden')).toBe(false);
  });

  it('should validate form fields before starting the quiz', () => {
    const { document } = setupDOM();
    const btnStart = document.getElementById('btn-start');
    
    // Click start with empty inputs
    let alerted = false;
    document.defaultView.alert = () => { alerted = true; };
    
    btnStart.click();
    expect(alerted).toBe(true);
    expect(document.getElementById('start-view').classList.contains('hidden')).toBe(false);
  });

  it('should start the quiz when inputs are valid', () => {
    const { document } = setupDOM();
    const caregiverName = document.getElementById('caregiver-name');
    const childAge = document.getElementById('child-age');
    const btnStart = document.getElementById('btn-start');
    
    caregiverName.value = 'Sarah';
    childAge.value = '19-24';
    btnStart.click();
    
    expect(document.getElementById('start-view').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('quiz-view').classList.contains('hidden')).toBe(false);
    
    // Check initial progress text
    expect(document.getElementById('quiz-progress-text').textContent).toContain('Question 1 of 20');
  });

  it('should score 0 (Low Risk) when all answers are normal (no risk flags)', () => {
    const { document } = setupDOM();
    
    // Fill form and start
    document.getElementById('caregiver-name').value = 'Sarah';
    document.getElementById('child-age').value = '19-24';
    document.getElementById('btn-start').click();

    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    // Normal answers:
    // Q2, Q5, Q12: Normal is NO.
    // Others: Normal is YES.
    const answers = [
      true,  // Q1
      false, // Q2 (reverse coded: Yes is risk, No is normal)
      true,  // Q3
      true,  // Q4
      false, // Q5 (reverse coded: Yes is risk, No is normal)
      true,  // Q6
      true,  // Q7
      true,  // Q8
      true,  // Q9
      true,  // Q10
      true,  // Q11
      false, // Q12 (reverse coded: Yes is risk, No is normal)
      true,  // Q13
      true,  // Q14
      true,  // Q15
      true,  // Q16
      true,  // Q17
      true,  // Q18
      true,  // Q19
      true   // Q20
    ];

    answers.forEach(ans => {
      if (ans) {
        btnYes.click();
      } else {
        btnNo.click();
      }
    });

    expect(document.getElementById('quiz-view').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('results-view').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('results-score-num').textContent).toBe('0');
    expect(document.getElementById('results-badge').textContent).toContain('Low Risk');
  });

  it('should score 20 (High Risk) when all answers are at-risk', () => {
    const { document } = setupDOM();
    
    document.getElementById('caregiver-name').value = 'Sarah';
    document.getElementById('child-age').value = '19-24';
    document.getElementById('btn-start').click();

    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    // At risk answers:
    // Q2, Q5, Q12: Risk is YES.
    // Others: Risk is NO.
    const answers = [
      false, // Q1
      true,  // Q2 (reverse coded)
      false, // Q3
      false, // Q4
      true,  // Q5 (reverse coded)
      false, // Q6
      false, // Q7
      false, // Q8
      false, // Q9
      false, // Q10
      false, // Q11
      true,  // Q12 (reverse coded)
      false, // Q13
      false, // Q14
      false, // Q15
      false, // Q16
      false, // Q17
      false, // Q18
      false, // Q19
      false  // Q20
    ];

    answers.forEach(ans => {
      if (ans) {
        btnYes.click();
      } else {
        btnNo.click();
      }
    });

    expect(document.getElementById('results-score-num').textContent).toBe('20');
    expect(document.getElementById('results-badge').textContent).toContain('High Risk');
  });
});

describe('M-CHAT-R Screener - Chinese Page Integration Tests', () => {
  const html = loadScreenerHTML('docs/zh/screening.html');

  const setupDOM = () => {
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    const { window } = dom;
    const { document } = window;
    return { window, document };
  };

  it('should start and score 4 (Medium Risk) on Chinese questionnaire', () => {
    const { document } = setupDOM();
    
    document.getElementById('caregiver-name').value = '李明';
    document.getElementById('child-age').value = '25-30';
    document.getElementById('btn-start').click();

    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    // Set up answers to result in exactly 4 risk flags:
    // Risk flags on: Q1 (No), Q3 (No), Q5 (Yes - reverse), Q12 (Yes - reverse).
    // Others are normal.
    const answers = [
      false, // Q1 (Risk flag 1)
      false, // Q2 (Normal)
      false, // Q3 (Risk flag 2)
      true,  // Q4 (Normal)
      true,  // Q5 (Risk flag 3 - reverse Yes)
      true,  // Q6 (Normal)
      true,  // Q7 (Normal)
      true,  // Q8 (Normal)
      true,  // Q9 (Normal)
      true,  // Q10 (Normal)
      true,  // Q11 (Normal)
      true,  // Q12 (Risk flag 4 - reverse Yes)
      true,  // Q13 (Normal)
      true,  // Q14 (Normal)
      true,  // Q15 (Normal)
      true,  // Q16 (Normal)
      true,  // Q17 (Normal)
      true,  // Q18 (Normal)
      true,  // Q19 (Normal)
      true   // Q20 (Normal)
    ];

    answers.forEach(ans => {
      if (ans) {
        btnYes.click();
      } else {
        btnNo.click();
      }
    });

    expect(document.getElementById('results-score-num').textContent).toBe('4');
    expect(document.getElementById('results-badge').textContent).toContain('中风险');
  });
});
