import { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { entrar as iniciarSessao, mostrarErro } from '../lib/api';

export default function LoginScreen() {

  const [numeroConta, setNumeroConta] = useState('');
  const [pin, setPin] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (numeroConta.trim() === '' || pin === '') {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    try {
      const r = await iniciarSessao(numeroConta.trim(), pin);
      // No primeiro acesso o cliente tem de mudar logo o PIN inicial
      router.replace(r.primeiroAcesso ? '/alterar-pin' : '/dashboard');
    } catch (e) {
      mostrarErro(e, 'Não foi possível entrar');
      setPin('');
    } finally {
      setCarregando(false);
    }
  }

  return (

    <View style={styles.container}>

      <StatusBar background-Color="#14532D" barStyle="light-content" />

      <View style={styles.header}>

        <Text style={styles.logo}>BancoMobile</Text>

        <Text style={styles.subtitulo}>
          O seu banco, sempre consigo.
        </Text>

      </View>

      <View style={styles.formulario}>

        <Text style={styles.titulo}>
          Bem-vindo!
        </Text>

        <Text style={styles.descricao}>
          Entre na sua conta bancária.
        </Text>

        <Text style={styles.label}>
          Número da conta
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Introduza o número da conta"
          keyboardType="numeric"
          value={numeroConta}
          onChangeText={setNumeroConta}
        />

        <Text style={styles.label}>
          PIN
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Introduza o seu PIN"
          keyboardType="numeric"
          secureTextEntry={true}
          maxLength={4}
          value={pin}
          onChangeText={setPin}
        />

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.7 }]}
          onPress={entrar}
          disabled={carregando}
        >

          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>
              ENTRAR
            </Text>
          )}

        </TouchableOpacity>

        <Text style={styles.rodape}>
          BancoMobile © 2026
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F1F8F4',
  },

  header: {
    backgroundColor: '#14532D',
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#D1FAE5',
    fontSize: 15,
    marginTop: 10,
  },

  formulario: {
    padding: 25,
    marginTop: 25,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#14532D',
  },

  descricao: {
    color: '#64748B',
    marginTop: 8,
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14532D',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 22,
    fontSize: 15,
  },

  botao: {
    backgroundColor: '#15803D',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  rodape: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 35,
  },

});