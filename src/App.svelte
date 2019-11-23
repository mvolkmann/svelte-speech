<script>
  const prompt = 'Please talk to me.';
  const synth = window.speechSynthesis;

  const textTransformMap = {
    lowercase: 'lowercase',
    normal: 'none',
    uppercase: 'uppercase'
  };
  const textTransforms = Object.keys(textTransformMap);

  let color = 'black';
  let lines;
  let textCase = 'none';
  let transcript;

  let wakeName = 'Google';
  let wakeWord = 'Hey';
  $: wakePhrase = wakeWord + ' ' + wakeName;

  $: style = `color: ${color}; text-transform: ${textCase}`;
  
  function clear() {
    lines = [prompt, ''];
  }

  const caseInsensitiveStartsWith = (text, phrase) => text.toLowerCase().startsWith(phrase.toLowerCase());
  
  function speak(phrase) {
    const utterance = new SpeechSynthesisUtterance(phrase);
    synth.speak(utterance);
  }

  function startListening() {
    const sr = new webkitSpeechRecognition();
    sr.interimResults = true;
    sr.lang = 'en-US';

    sr.onresult = result => {
      //console.log('App.svelte x: result.results =', result.results);
      //const [[{transcript}]] = result.results;
      const resultList = Array.from(result.results);
      transcript = resultList.map(r => r[0].transcript).join(' ');
      console.log('App.svelte x: transcript =', transcript);
      console.log('App.svelte x: wakePhrase =', wakePhrase);
    };

    //sr.onstart = () => console.log('got start');
    sr.onend = () => {
      //console.log('got end');
      lines.push('');
      lines = lines;
      setTimeout(startListening);
    };

    sr.onspeechend = () => {
      console.log('speechend: transcript =', transcript);
      if (caseInsensitiveStartsWith(transcript, wakePhrase)) {
        const command = transcript.substring(wakePhrase.length + 1).trim().toLowerCase();
        console.log('App.svelte x: command =', command);
        if (command === 'clear') {
          clear();
        } else if (command.startsWith('set color ')) {
          color = command.split(' ')[2].toLowerCase();
        } else if (textTransforms.includes(command)) {
          textCase = textTransformMap[transcript];
        } else if (command) {
          console.log('App.svelte x: unsupported command');
          sr.stop();
          speak('Sorry Dave, I don\'t understand ' + command);
        }
      } else {
        const index = lines.length - 1;
        lines[index] = transcript[0].toUpperCase() + transcript.substring(1) + '.';
      }
    };

    sr.onerror = err => {
      if (err.error === 'no-speech') {
        lines.push(prompt);
        lines = lines;
      } else {
        console.error(err);
        alert(JSON.stringify(err));
      }
    };

    sr.start();
  }

  clear();
  startListening();
</script>

<style>
  button:disabled {
    background-color: pink;
    color: gray;
  }

  div {
    font-family: sans-serif;
    font-size: 36px;
  }
</style>

<label>
  Wake Word
  <input bind:value={wakeWord} />
</label>

<label>
  Wake Name
  <input bind:value={wakeName} />
</label>

{#each lines as line}
  <div style={style}>{line}</div>
{/each}
