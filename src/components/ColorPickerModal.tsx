import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ColorPicker, { Panel1, HueSlider, OpacitySlider, InputWidget } from 'reanimated-color-picker';

interface ColorPickerModalProps {
  visible: boolean;
  currentColor: string;
  onPick: (color: string) => void;
  onClose: () => void;
}

export default function ColorPickerModal({
  visible,
  currentColor,
  onPick,
  onClose,
}: ColorPickerModalProps) {
  const [localColor, setLocalColor] = useState(currentColor || '#ffffff');
  const pickerRef = React.useRef<any>(null);
  
  useEffect(() => {
    if (visible) {
      const initialColor = (currentColor && currentColor !== 'transparent') ? currentColor : '#000000';
      setLocalColor(initialColor);
      pickerRef.current?.setColor(initialColor);
    }
  }, [visible, currentColor]);

  const handleSelect = () => {
    onPick(localColor);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.card} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Custom Color</Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && styles.closeBtnPressed,
                ]}
              >
                <MaterialIcons name="close" size={22} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.pickerContainer}>
              <ColorPicker
                ref={pickerRef}
                style={{ width: '100%', gap: 15 }}
                value={currentColor === 'transparent' ? '#000000' : (currentColor || '#ffffff')}
                onChangeJS={(colors) => setLocalColor(colors.hex)}
              >
                <Panel1 style={{ width: '100%', height: 200, borderRadius: 10 }} />
                <HueSlider style={{ width: '100%', height: 30, borderRadius: 15 }} />
                <OpacitySlider style={{ width: '100%', height: 30, borderRadius: 15 }} />
                <InputWidget
                  formats={["HEX"]}
                  inputStyle={{ 
                    color: '#F8FAFC', 
                    backgroundColor: '#0F172A',
                    borderColor: '#334155', 
                    borderWidth: 1,
                    borderRadius: 8
                  }}
                  inputTitleStyle={{ color: '#94A3B8' }}
                  iconColor="#F8FAFC"
                  containerStyle={{ marginTop: 5 }}
                />
              </ColorPicker>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={handleSelect}
                style={({ pressed }) => [
                  styles.button,
                  styles.doneBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.doneText}>Select</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "88%",
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: "bold",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0F172A',
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPressed: {
    backgroundColor: '#334155',
  },
  pickerContainer: {
    paddingVertical: 20,
    width: '100%',
  },
  actions: {
    flexDirection: "row",
    marginTop: 18,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    backgroundColor: '#38BDF8',
  },
  doneText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: "bold",
  },
  btnPressed: {
    opacity: 0.88,
  },
});
