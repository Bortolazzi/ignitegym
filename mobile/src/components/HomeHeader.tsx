import { TouchableOpacity } from 'react-native';
import { HStack, VStack, Heading, Text, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

import { UserPhoto } from '@components/UserPhoto';
import { useAuth } from '@hooks/useAuth';

import defaultUserPhotoImg from '@assets/userPhotoDefault.png';

export function HomeHeader() {
    const { user, signOutAsync } = useAuth();

    return (
        <HStack
            bg="gray.600"
            pt={16}
            pb={5}
            px={8}
            alignItems="center"
        >
            <UserPhoto
                source={user.avatar ? { uri: user.avatar } : defaultUserPhotoImg}
                alt='Imagem do usuário'
                size={16}
                mr={4}
            />
            <VStack flex={1}>
                <Text
                    color="gray.100"
                    fontSize="md"
                >
                    Olá
                </Text>

                <Heading
                    color="gray.100"
                    fontSize="md"
                    fontFamily="heading"
                >
                    {user.name}
                </Heading>
            </VStack>

            <TouchableOpacity
                onPress={signOutAsync}
            >
                <Icon
                    as={MaterialIcons}
                    name="logout"
                    color="gray.200"
                    size={7}
                />
            </TouchableOpacity>
        </HStack>
    );
}