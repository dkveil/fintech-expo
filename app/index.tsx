import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { useEvent } from 'expo';
import { Link } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

const videoBackgroundSource: VideoSource = {
  assetId: require('@/assets/videos/intro.mp4'),
  metadata: {
    title: 'Intro mp4',
    artist: 'one',
  },
};

export default function IntroScreen() {
  const player = useVideoPlayer(videoBackgroundSource, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const { status } = useEvent(player, 'statusChange', { status: player.status });

  return (
    <View style={styles.container}>
      {status === 'readyToPlay' && <VideoView player={player} style={styles.videoBackground} nativeControls={false}></VideoView>}

      <View style={styles.contentContainer}>
        <Text style={styles.header}>Ready to change the way you money?</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Link href='/login' style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white' }]} asChild>
          <TouchableOpacity>
            <Text style={{ color: Colors.light.dark, fontSize: 22, fontWeight: '500' }}>Log in</Text>
          </TouchableOpacity>
        </Link>
        <Link href='/signup' style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white' }]} asChild>
          <TouchableOpacity>
            <Text style={{ color: Colors.light.dark, fontSize: 22, fontWeight: '500' }}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    marginTop: 80,
    padding: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
});
