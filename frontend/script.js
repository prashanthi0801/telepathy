/* * MOCK SOCKET SYSTEM
         * Simulates backend socket.io functionality
         */
        class MockSocket {
            constructor() {
                this.connected = false;
                this.mockUsers = [];
                this.eventListeners = {};
            }

            on(event, callback) {
                if (!this.eventListeners[event]) this.eventListeners[event] = [];
                this.eventListeners[event].push(callback);
            }

            emit(event, data) {
                // Simulate network delay
                setTimeout(() => {
                    this.handleServerResponse(event, data);
                }, 100);
            }

            handleServerResponse(event, data) {
                if (event === 'join') {
                    // Trigger update users for the client
                    this.trigger('userList', this.mockUsers);
                    // Simulate welcome message
                    this.trigger('message', {
                        sender: 'SYSTEM',
                        text: `User ${data} has connected to the neural net.`,
                        channel: 'global',
                        timestamp: new Date().toLocaleTimeString()
                    });
                } else if (event === 'sendMessage') {
                    // Echo back to sender and "others"
                    this.trigger('message', {
                        sender: data.sender,
                        text: data.text,
                        channel: data.channel,
                        timestamp: new Date().toLocaleTimeString()
                    });

                    // 30% chance a bot replies if in global AND users exist
                    if (data.channel === 'global' && Math.random() > 0.7 && this.mockUsers.length > 0) {
                        setTimeout(() => {
                            const rando = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
                            this.trigger('message', {
                                sender: rando.name,
                                text: this.getRandomPhrase(),
                                channel: 'global',
                                timestamp: new Date().toLocaleTimeString()
                            });
                        }, 2000);
                    } 
                    // If direct message, simulate reply
                    else if (data.channel !== 'global') {
                        setTimeout(() => {
                            this.trigger('message', {
                                sender: data.channel, // The person you talked to replies
                                text: "Copy that. Data received.",
                                channel: data.sender, // They send it back to you
                                timestamp: new Date().toLocaleTimeString()
                            });
                        }, 1500);
                    }
                }
            }

            trigger(event, payload) {
                if (this.eventListeners[event]) {
                    this.eventListeners[event].forEach(cb => cb(payload));
                }
            }

            getRandomPhrase() {
                const phrases = [
                    "Signal is weak in sector 7.",
                    "Who is watching the watchers?",
                    "Did you see the new protocol?",
                    "System needs a reboot.",
                    "ACK.",
                    "Uploading..."
                ];
                return phrases[Math.floor(Math.random() * phrases.length)];
            }
        }

        /* * APP LOGIC
         */
        const app = {
            socket: new MockSocket(),
            username: null,
            currentChannel: 'global', // 'global' or a specific username
            messages: [], // Store all messages locally

            init() {
                // Event Bindings
                document.getElementById('connect-btn').addEventListener('click', () => this.login());
                document.getElementById('username-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.login();
                });
                document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
                document.getElementById('msg-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });

                // Socket Listeners
                this.socket.on('userList', (users) => this.renderUserList(users));
                this.socket.on('message', (msg) => this.receiveMessage(msg));
            },

            login() {
                const input = document.getElementById('username-input');
                const name = input.value.trim();
                
                if (!name) {
                    const err = document.getElementById('login-error');
                    err.innerText = "ERR: IDENTITY_REQUIRED";
                    err.classList.remove('hidden');
                    return;
                }

                this.username = name;
                document.getElementById('current-user-display').innerText = `ID: ${name}`;
                
                // Switch Views
                document.getElementById('login-page').classList.add('hidden');
                document.getElementById('chat-page').classList.remove('hidden');
                
                // Init Socket
                this.socket.emit('join', name);
            },

            logout() {
                location.reload();
            },

            renderUserList(users) {
                const listContainer = document.getElementById('users-list');
                listContainer.innerHTML = '';

                users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = 'user-item flex items-center gap-2';
                    div.dataset.uid = user.name;
                    div.innerHTML = `
                        <div class="w-2 h-2 rounded-full bg-[var(--phosphor-main)] shadow-[0_0_5px_var(--phosphor-main)] status-dot"></div>
                        <span>${user.name}</span>
                    `;
                    div.onclick = () => this.switchChannel(user.name);
                    listContainer.appendChild(div);
                });
            },

            switchChannel(channelName) {
                this.currentChannel = channelName;
                
                // Update Header
                const header = document.getElementById('chat-header');
                const status = document.getElementById('chat-status');
                
                if (channelName === 'global') {
                    header.innerText = "GLOBAL_NET";
                    status.innerText = "PUBLIC BROADCAST";
                    // Visual selection update
                    document.getElementById('channel-global').classList.add('active');
                    document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
                } else {
                    header.innerText = `LINK: ${channelName.toUpperCase()}`;
                    status.innerText = "ENCRYPTED P2P CHANNEL";
                    
                    // Visual selection update
                    document.getElementById('channel-global').classList.remove('active');
                    document.querySelectorAll('.user-item').forEach(el => {
                        if (el.dataset.uid === channelName) el.classList.add('active');
                        else el.classList.remove('active');
                    });
                }

                this.renderMessages();
            },

            sendMessage() {
                const input = document.getElementById('msg-input');
                const text = input.value.trim();
                if (!text) return;

                const payload = {
                    sender: this.username,
                    text: text,
                    channel: this.currentChannel
                };

                this.socket.emit('sendMessage', payload);
                input.value = '';
                input.focus();
            },

            receiveMessage(msg) {
                // Logic to determine where message belongs
                // 1. If global, belongs in global.
                // 2. If DM, belongs in channel matching the Other Person's name.
                
                // Normalize channel for storage
                let storageChannel = msg.channel;
                
                // If I sent a DM to 'Bob', storage channel is 'Bob'.
                // If 'Bob' sent a DM to me, msg.channel is 'Me', but I need to store it under 'Bob'.
                if (msg.channel !== 'global') {
                    if (msg.sender === this.username) {
                        storageChannel = msg.channel;
                    } else {
                        storageChannel = msg.sender;
                    }
                }

                this.messages.push({ ...msg, storageChannel });
                this.renderMessages();
            },

            renderMessages() {
                const container = document.getElementById('messages-area');
                container.innerHTML = ''; // Clear current view

                // Filter messages for current channel
                const filtered = this.messages.filter(m => m.storageChannel === this.currentChannel);

                filtered.forEach(msg => {
                    const isMe = msg.sender === this.username;
                    const isSystem = msg.sender === 'SYSTEM';
                    
                    const div = document.createElement('div');
                    div.className = `msg-bubble ${isMe ? 'msg-self' : 'msg-other'}`;
                    
                    if (isSystem) {
                        div.style.borderColor = '#555';
                        div.style.color = '#888';
                        div.style.fontStyle = 'italic';
                        div.style.alignSelf = 'center';
                    }

                    div.innerHTML = `
                        <div class="text-xs opacity-50 mb-1 flex justify-between gap-4">
                            <span>${isMe ? 'YOU' : msg.sender}</span>
                            <span>${msg.timestamp}</span>
                        </div>
                        <div class="text-lg">${msg.text}</div>
                    `;
                    container.appendChild(div);
                });

                // Auto scroll to bottom
                container.scrollTop = container.scrollHeight;
            }
        };

        // Start App
        window.onload = () => app.init();