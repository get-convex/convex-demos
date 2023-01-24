import process from 'process';
import React, {useState, StrictMode} from 'react';
import {useMutation, useQuery} from './convex/_generated/react';
import {ConvexProvider, ConvexReactClient} from 'convex/react';
import styles from './styles';
import {
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

function InnerApp() {
  const messages = useQuery('listMessages') || [];

  const [newMessageText, setNewMessageText] = useState('');
  const sendMessage = useMutation('sendMessage');


  const [name] = useState(() => 'User ' + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText('');
    await sendMessage(newMessageText, name);
  }

  return (
    <SafeAreaView style={styles.body}>
      <Text style={styles.title}>Convex Chat</Text>
      <View style={styles.name}><Text style={styles.nameText} testID="NameField">{name}</Text></View>
      <FlatList
        data={messages.slice(-10)}
        testID="MessagesList"
        renderItem={x => {
          const message = x.item;
          return (
            <View style={styles.messageContainer}>
              <Text>
                <Text style={styles.messageAuthor}>{message.author}:</Text> {message.body}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(message._creationTime).toLocaleTimeString()}
              </Text>
            </View>
          );
        }}
      />
      <TextInput
        placeholder="Write a message…"
        style={styles.input}
        onSubmitEditing={handleSendMessage}
        onChangeText={newText => setNewMessageText(newText)}
        defaultValue={newMessageText}
        testID="MessageInput"
      />
    </SafeAreaView>
  );
}

const App = () => {
  const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL, {
    // We need to disable this to be compatible with React Native
    unsavedChangesWarning: false,
  });
  return (
    <StrictMode>
      <ConvexProvider client={convex}>
        <InnerApp />
      </ConvexProvider>
    </StrictMode>
  );
};

export default App;
