/** @odoo-module */
const { Component, xml, mount, useState, setup, onRendered, trigger, EventBus, updated,rerender, onUpdateProps   } = owl;
const bus = new EventBus();
let audio = '';;
const parser = new DOMParser();

class Player extends Component {
    static template = xml`
      <div style="position:absolute;bottom:0px;">
        <h2 id="song-title">Song Title</h2>
        <div id="player-controls">
          <button id="previous-button" t-on-click="pauseThisSong">Pause</button>
          <button id="play_btn" t-on-click="playThisSong">Play</button>
          <button id="next-button" t-on-click="stopThisSong">Stop</button>
        </div>
      </div>
    `;
    playThisSong() {
      if (!audio) {
        return;
      }
      audio.play();
    }
    pauseThisSong() {
      if (!audio) {
        return;
      }
      audio.pause();
    }
    stopThisSong() {
      if (!audio) {
        return;
      }
      audio.pause();
      audio.currentTime = 0;
    }
    static props = ['songs'];
  }

class SongItems extends Component {
    static template = xml /*xml*/`
    <div>
        <table>

        </table>
    </div>
    `;
    playThisSong(){
        debugger;
    }

    static props = ['songitems']
}

class PlayList extends Component {
    static template = xml /*xml*/`
    <div style="float: right">
    <SongItems songitems="props.playlist"/>
    </div>
    `;

    static props = ['playlist'];
    static components = { SongItems };
}

class MusicData extends Component { 
    static template = xml/*xml*/`
    <div id="MusicList" style="float:left">
      <div>
      <select name="songs" id="songs_data" t-on-change="songSelected">
        <option value="">Select a song</option>
          <t t-if="props.musicdata[0]">
            <t t-foreach="props.musicdata[0]" t-as="song" t-key="song.id">
              <option t-att-value="song.url">
                <t t-esc="song.name"/>
              </option>
            </t>
          </t>
      </select>
      </div>
    </div>
    `;
songSelected(ev) {
    const selectedSongUrl = ev.target.value;
    const selectedSong = this.props.musicdata[0].find(song => song.url === selectedSongUrl);
    document.getElementById('song-title').textContent = selectedSong.name;
    audio = new Audio(selectedSongUrl);
    audio.load();
}

  static props = ['musicdata']
}

class Search extends Component {
    static template = xml/*xml*/`
    <div>
        <div style="border:1px,solid,black;text-align:center">
            <input type="text" id="searchSong" placeholder="Search a music" value="Akon-Beautiful"/>
            <button t-on-click="getMusic" id="SearchButton">Search</button>
        </div>
        <MusicData musicdata="searchData"/>
    </div>
    `;

    setup() {
        this.searchData = useState([]);
    }

    async getMusic() {
        const findSong = document.getElementById('searchSong').value;
        const response = await fetch(`/music/search?song_name=${findSong}`);
        const {result : newData}= await response.json();
        this.searchData.pop();
        this.searchData.push(newData);
        this.props.updateFoundMusic(newData);
    }

    playThisSong (ev) {
        const selectedSongUrl = ev.target.attributes['att-value'].value;
        const selectedSong = this.props.list[0].find(song => song.url === selectedSongUrl);
        document.getElementById('song-title').textContent = selectedSong.name;
        audio = new Audio(selectedSongUrl);
        audio.load();
        audio.play();
    }

    addToList(ev) {
        const td = document.getElementById('tableContent')
        const template = `<td><div><button id="play_btn" t-on-click="playThisSong">Play</button><button>remove</button></div></td>`;
        let tmpl = parser.parseFromString(template, "text/html").body.childNodes;
        td.append(tmpl[0]);
    }

    static components = { MusicData }

    static props = ['list', 'updateFoundMusic']
}

class RootStructure extends Component {
    static template = xml/*xml*/`
        <style>
            body {
                margin: 0;
                padding: 0;
                height: 100vh;
            }
        </style>
        <div id="Container" style="position:relative;height:100%">
            <Search list="foundMusic" updateFoundMusic="this.updateFoundMusic"/>
            <PlayList playlist="foundMusic"/>
            <Player songs="foundMusic"/>
        </div>`;
    
    setup(){this.foundMusic = useState([]);}    
    updateFoundMusic = (newData) => {
        this.foundMusic.pop();
        this.foundMusic.push(newData);
    }      

    static components = { Search, PlayList, Player };
}
window.onload = function() {
    dataset = [];
    mount(RootStructure, document.body, {dev:true});

};
