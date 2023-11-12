import { useNavigation } from "@react-navigation/native";
import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base";

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { useAuth } from '@hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup';
import { api } from '@services/api';
import { AppError } from "@utils/AppError";

type FormDataProps = {
  email: string;
  password: string;
}

const signUpSchema = yup.object({
  email: yup.string().required('Informe o e-mail').email('E-mail inválido'),
  password: yup.string().required('Informe a senha').min(6, 'A senha deve conter pelo menos 6 digitos'),
});

export function SignIn() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const toast = useToast();
  const { signIn } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema)
  });

  function handleNewAccount() {
    navigation.navigate('signUp');
  }

  async function handleSignIn({ email, password }: FormDataProps) {
    try {
      const response = await api.post('/sessions', { email, password });
      console.log(response.data);


    } catch (exception) {
      const isAppError = exception instanceof AppError;
      const title = isAppError ? exception.message : "Não foi acessar a conta. Tente novamente mais tarde";

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />

        <Center my={24}>
          <LogoSvg />

          <Text color="gray.100" fontSize="sm">
            Treine sua mente e o seu corpo.
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Acesse a conta
          </Heading>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='E-mail'
                keyboardType='email-address'
                autoCapitalize='none'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Senha'
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
                onSubmitEditing={handleSubmit(handleSignIn)}
                returnKeyType='send'
              />
            )}
          />

          <Button
            title="Acessar"
            onPress={handleSubmit(handleSignIn)}
          />
        </Center>

        <Center mt={24}>
          <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
            Ainda não tem acesso?
          </Text>

          <Button
            title="Criar Conta"
            variant="outline"
            onPress={handleNewAccount}
          />
        </Center>
      </VStack>
    </ScrollView>
  );
}