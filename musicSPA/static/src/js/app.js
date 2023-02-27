/** @odoo-module */
const { Component, xml, mount, useState,useEffect, setup } = owl;
let audio = '';
let albumHasSong = '';

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
  }

class SongItems extends Component {
    static template = xml /*xml*/`
    <div>
        <table>
            <t t-if="props.songitems[0]">
                <t t-foreach="props.songitems" t-as="song" t-key="song.id">
                    <tr>
                        <td>
                            <div>
                                <p id="song_name"><t t-out="song.name"/></p>
                                <button t-on-click="removeFromList" id="listadded" t-att-value="song.url">Remove</button>
                                <button t-attf-id="play-song-{{song.name}}" t-att-value="song.url" t-on-click="playThisSong">Play song</button>
                            </div>
                        </td>
                    </tr>
                </t>
            </t>
        </table>
    </div>
    `;
   
    removeFromList(ev) {
      const selectedSongUrl = ev.target.getAttribute('value');
      const selectedIndex = this.props.songitems.findIndex(song => song.url === selectedSongUrl);
      if (selectedIndex !== -1) {
        this.props.songitems.splice(selectedIndex, 1);
      }
    }
    

    playThisSong(ev) {
        const selectedSongUrl = ev.target.getAttribute('value');
        const selectedSong = this.props.songitems.find(song => song.url === selectedSongUrl);
        document.getElementById('song-title').textContent = selectedSong.name;
        audio = new Audio(selectedSongUrl);
        audio.play();
    }

    static props = ['songitems']
}

class PlayList extends Component {
    static template = xml /*xml*/`
    <div style="float: right">
    Your Playlist
        <SongItems songitems="props.playlist"/>
    </div>
    `;

    static props = ['playlist'];
    static components = { SongItems };
}

class MusicData extends Component {
    static template = xml/*xml*/ `
    <div id="MusicList" style="float:left">
    <table>
      <t t-if="props.albumdata[0] and props.albumdata[0] !== 'Album not Found'">
        <tr>
          <td>
            <t t-foreach="props.albumdata[0]" t-as="album" t-key="album.id">
              <div>
                <p><t t-out="album.name"/></p>
                <button t-attf-id="{{album.name}}" t-on-click="openAlbum">Open Album</button>
              </div>
            </t>
          </td>
        </tr>
      </t>
      <t t-if="albumHasSong[0] or (props.musicdata[0])">
        <h2>List of Songs</h2>
        <ul id="songConatiner">
          <t t-if="props.musicdata[0] !== 'Song not Found'">
            <t t-foreach="props.musicdata[0]" t-as="song" t-key="song.id">
              <li>
                <p><t t-out="song.name"/></p>
                <button t-attf-id="add-song-{{song.id}}" t-att-value="song.url" t-on-click="addSongToPlaylist">Add to playlist</button>
                <button t-attf-id="play-song-{{song.name}}" t-att-value="song.url" t-on-click="playSong">Play song</button>
              </li>
            </t>
          </t>
          <t t-if="albumHasSong[0] and props.albumdata[0] !== 'Album not Found'">
            <t t-foreach="albumHasSong[0]" t-as="song" t-key="song.id">
              <li>
                <p><t t-out="song.name"/></p>
                <button t-attf-id="add-song-{{song.id}}" t-att-value="song.url" t-on-click="addSongToPlaylist">Add to playlist</button>
                <button t-attf-id="play-song-{{song.name}}" t-att-value="song.url" t-on-click="playSong">Play song</button>
              </li>
            </t>
          </t>
        </ul>
      </t>
    </table>
  </div>
`;  

    setup() {
        this.albumHasSong = useState([]);
    }
    
    async openAlbum(ev) {
        const selectedAlbumName = ev.target.getAttribute('id');
        const response = await fetch(`/music/fetch?album_name=${selectedAlbumName}`);
        const {result : newData} = await response.json();
        this.albumHasSong.pop(); // remove previously filled data if any
        this.albumHasSong.push(newData);
    }

    addSongToPlaylist(ev) {
        let musicInfo = this.albumHasSong[0] || this.props.musicdata[0] 
        const selectedSongUrl = ev.target.getAttribute('value');
        const selectedSong = musicInfo.find(song => song.url === selectedSongUrl);
        this.props.updateAddToPlayList(selectedSong); // this will update the data on root componenet which we will send to playlist component 
    }
  
    playSong(ev) {
        let musicInfo = this.albumHasSong[0] || this.props.musicdata[0];
        const selectedSongUrl = ev.target.getAttribute('value');
        const selectedSong = musicInfo.find(song => song.url === selectedSongUrl);
        document.getElementById('song-title').textContent = selectedSong.name;
        audio = new Audio(selectedSongUrl);
        audio.play();
    }
  
    static props = ['musicdata','albumdata', 'updateAddToPlayList'];
  }

class Search extends Component {
    static template = xml/*xml*/`
    <div>
        <div style="border:1px,solid,black;text-align:center">
            <input type="text" id="searchSong" placeholder="Search a music" value="Freedom"/>
            <button t-on-click="getMusic" id="SearchButton">Search</button>
        </div>
        <MusicData musicdata="searchData" albumdata="albumData" updateAddToPlayList="props.updateAddToPlayList"/>
    </div>
    `;

    setup() {
        this.searchData = useState([]);
        this.albumData = useState([]);
    }

    async getMusic() {
        const findSong = document.getElementById('searchSong').value;
        const response = await fetch(`/music/search?song_name=${findSong}`);
        const {result : newData, albumdata: album}= await response.json();
        this.searchData.pop();
        this.albumData.pop();
        this.searchData.push(newData);
        this.albumData.push(album);
    }

    static components = { MusicData }

    static props = ['updateAddToPlayList'];
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
            <Search updateAddToPlayList="this.updateAddToPlayList"/>
            <PlayList playlist="addToPlaylist"/>
            <Player/>
        </div>
    `;
    
    setup(){
        this.addToPlaylist = useState([]);
    }

    //we will add songs individually , which needs to be updated everytime
    updateAddToPlayList = (newData) => {
        if (JSON.stringify(this.addToPlaylist).includes(JSON.stringify(newData))) {
            return;
        }
        this.addToPlaylist.push(newData);
    }     

    static components = { Search, PlayList, Player };
}
window.onload = function() {
    mount(RootStructure, document.body, {dev:true});

};
