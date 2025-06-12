import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Image, TouchableWithoutFeedback } from 'react-native';
import { icons } from '@/constants/icons';

interface Props {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onPress?: () => void;
}

const SearchBar = ({ placeholder, value, onChangeText, onPress }: Props) => {
    const [input, setInput] = useState<string>(value);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep local input in sync if parent value changes
    useEffect(() => {
        setInput(value);
    }, [value]);

    // Debounce onChangeText calls
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            onChangeText(input);
        }, 1000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [input, onChangeText]);

    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View className="flex-row items-center bg-dark-100 rounded-full px-5 py-3">
                <Image
                    source={icons.search}
                    className="w-5 h-5 mr-2"
                    resizeMode="contain"
                    tintColor="#ab8bff"
                />
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder={placeholder}
                    placeholderTextColor="#a8b5bd"
                    className="flex-1 text-white text-base"
                    editable={!onPress}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default SearchBar;
