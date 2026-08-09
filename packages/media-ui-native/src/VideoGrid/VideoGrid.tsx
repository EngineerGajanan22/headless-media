import {
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export interface VideoItem {
  id: number;
  thumbnailUrl: string;
  duration: number;
  width: number;
  height: number;
  userName: string;
  videoUrl?: string;
}

export interface VideoGridProps {
  videos: VideoItem[];
  selectedId?: number | null;
  isLoading?: boolean;
  hasMore?: boolean;
  onSelect?: (id: number) => void;
  onLoadMore?: () => void;
  numColumns?: number;
}

/**
 * Headless React Native VideoGrid component.
 *
 * Renders a responsive multi-column video grid using React Native `FlatList`.
 * Prop-only interface — zero imports from @headless-media/core or wrappers.
 */
export function VideoGrid({
  videos,
  selectedId,
  isLoading = false,
  hasMore = false,
  onSelect,
  onLoadMore,
  numColumns = 2,
}: VideoGridProps) {
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderItem = ({ item }: { item: VideoItem }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelect?.(item.id)}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.badge}>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={styles.authorBadge}>
          <Text style={styles.authorText} numberOfLines={1}>
            {item.userName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={videos}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      onEndReached={() => {
        if (hasMore && !isLoading) {
          onLoadMore?.();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#7c3aed" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 6,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e1e2d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#7c3aed',
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  authorBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '60%',
  },
  authorText: {
    color: '#e2e8f0',
    fontSize: 10,
  },
  loader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
