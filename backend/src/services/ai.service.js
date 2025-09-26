// src/services/ai.service.js
function generateFromPrompt(prompt = '', templateType) {
  const base = {
    name: `AI: ${prompt ? prompt.substring(0, 40) : 'Untitled'}`,
    meta: { prompt },
    objects: [
      { id: 'player1', type: 'player', x: 100, y: 300, w: 48, h: 48, props: { speed: 200 } },
      { id: 'ground', type: 'ground', x: 0, y: 380, w: 1200, h: 40 }
    ],
    settings: {}
  };

  const isRunner = /run|runner|endless/i.test(prompt) || templateType === 'runner';
  const isPlatformer = /platform|jump|platformer/i.test(prompt) || templateType === 'platformer';

  if (isRunner) {
    base.settings.mode = 'runner';
    base.objects.push({ id: 'obstacle1', type: 'obstacle', x: 600, y: 340, w: 30, h: 40 });
  } else if (isPlatformer) {
    base.settings.mode = 'platformer';
    base.objects.push({ id: 'platform1', type: 'platform', x: 300, y: 260, w: 120, h: 20 });
  } else {
    base.settings.mode = 'basic';
    base.objects.push({ id: 'box1', type: 'box', x: 450, y: 340, w: 40, h: 40 });
  }

  return base;
}

module.exports = { generateFromPrompt };
