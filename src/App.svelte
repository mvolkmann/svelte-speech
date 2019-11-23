<script>
  // https://duckduckgo.com/api

  const prompt = 'Please talk to me.';
  const synth = window.speechSynthesis;

  const textTransformMap = {
    lowercase: 'lowercase',
    reset: 'none',
    uppercase: 'uppercase'
  };
  const textTransforms = Object.keys(textTransformMap);

  let color = 'black';
  let lines;
  let textCase = 'none';
  let transcript;

  let wakeWord = 'Hey';
  let wakeName = 'Browser';
  $: wakePhrase = wakeWord + ' ' + wakeName;

  $: style = `color: ${color}; text-transform: ${textCase}`;
  
  function addLine(text) {
    let line = text[0].toUpperCase() + text.substring(1);
    if (!line.endsWith('.')) line += '.';
    lines.push(line);
    lines = lines;
  }

  function clear() {
    lines = [prompt];
  }

  function caseInsensitiveStartsWith(text, phrase) {
    if (!text) return '';
    return text.toLowerCase().startsWith(phrase.toLowerCase());
  }
  
  async function search(phrase) {
    const encoded = encodeURIComponent(phrase);
    const url = `http://localhost:1919/search/${encoded}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log('App.svelte search: json =', json);

      let text = json.AbstractText;
      if (!text) {
        const topic = json.RelatedTopics[0];
        text = topic ? topic.Text : 'I do not know that';
      }
      addLine(text);
      speak(text);
    } catch (e) {
      console.error(e);
    }
  }

  function speak(phrase) {
    /*
    const utterance = new SpeechSynthesisUtterance(phrase);
    synth.speak(utterance);
    */
  }

  function startListening() {
    try {
      const sr = new webkitSpeechRecognition();
      sr.interimResults = true;
      sr.lang = 'en-US';

      sr.onresult = result => {
        //console.log('App.svelte x: result.results =', result.results);
        //const [[{transcript}]] = result.results;
        const resultList = Array.from(result.results);
        transcript = resultList.map(r => r[0].transcript).join(' ');
      };

      sr.onend = () => setTimeout(startListening);

      sr.onspeechend = () => {
        if (!transcript) return;
        console.log('onspeechend: transcript =', transcript);

        if (caseInsensitiveStartsWith(transcript, wakePhrase)) {
          const command = transcript.substring(wakePhrase.length + 1).trim().toLowerCase();
          console.log('App.svelte x: command =', command);
          if (command === 'clear') {
            clear();
          } else if (command.startsWith('set color ')) {
            color = command.split(' ')[2].toLowerCase();
          } else if (textTransforms.includes(command)) {
            textCase = textTransformMap[command];
          } else if (command) {
            search(command);
            //console.log('App.svelte x: unsupported command');
            //sr.stop();
            //speak('Sorry Dave, I don\'t understand ' + command);
          }
        //} else {
        //  search(transcript);
        }

        transcript = '';
      };

      sr.onerror = err => {
        if (err.error === 'no-speech') {
          const lastLine = lines[lines.length - 1];
          console.log('App.svelte onerror: lastLine =', lastLine);
          if (lastLine !== prompt) {
            lines.push(prompt);
            lines = lines;
          }
        } else {
          console.error(err);
          alert(JSON.stringify(err));
        }
      };

      sr.start();
    } catch (e) {
      const msg = `This browser is not supported.\n${e.message}.`;
      alert(msg);
    }
  }

  clear();
  startListening();
</script>

<style>
  .attribution {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
  }

  button:disabled {
    background-color: pink;
    color: gray;
  }

  div {
    font-family: sans-serif;
    font-size: 18px;
  }

  .logo {
    height: 100px;
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

<div class="attribution">
  Results from
  <a href="http://duckduckgo.com" target="_blank">
    <img alt="DuckDuckGo logo" class="logo" src="images/DuckDuckGoLogo.png" />
  </a>
</div>

{#each lines as line}
  <div style={style}>{line}</div>
{/each}
