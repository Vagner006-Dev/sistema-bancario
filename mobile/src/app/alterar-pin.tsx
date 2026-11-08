import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { alterarPin as alterarPinApi, entrar, mostrarErro } from '../lib/api';
import { sessao, limparSessao, useExigirSessao } from '../lib/sessao';

export default function AlterarPinScreen() {

  useExigirSessao();

  const [pinAtual, setPinAtual] = useState('');
  const [novoPin, setNovoPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function alterarPin() {

    if (!pinAtual || !novoPin || !confirmarPin) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (!/^\d{4}$/.test(novoPin)) {
      Alert.alert('Atenção', 'O novo PIN deve ter 4 dígitos.');
      return;
    }

    if (novoPin !== confirmarPin) {
      Alert.alert('Erro', 'Os PINs não coincidem.');
      return;
    }

    if (novoPin === pinAtual) {
      Alert.alert('Erro', 'Escolha um PIN diferente do actual.');
      return;
    }

    setCarregando(true);
    try {
      await alterarPinApi(pinAtual, novoPin);
    } catch (e) {
      mostrarErro(e, 'Não foi possível alterar o PIN');
      setCarregando(false);
      return;
    }

    // O token do primeiro acesso só serve para mudar o PIN:
    // entra de novo com o PIN novo para obter o acesso completo.
    try {
      await entrar(sessao.numero as string, novoPin);
      Alert.alert(
        'Sucesso',
        'PIN alterado com sucesso!',
        [
          {
            text: 'Continuar',
            onPress: () => router.replace('/dashboard')
          }
        ]
      );
    } catch {
      limparSessao();
      Alert.alert(
        'PIN alterado',
        'Entre novamente com o seu novo PIN.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } finally {
      setCarregando(false);
    }
  }

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.titulo}>
          BancoMobile
        </Text>

        <Text style={styles.subtitulo}>
          Proteja a sua conta
        </Text>

      </View>

      <View style={styles.formulario}>

        <Text style={styles.tituloFormulario}>
          Alterar PIN
        </Text>

        <Text style={styles.descricao}>
          Por segurança, altere o seu PIN inicial para continuar.
        </Text>

        <Text style={styles.label}>
          PIN actual
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Introduza o PIN actual"
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          value={pinAtual}
          onChangeText={setPinAtual}
        />

        <Text style={styles.label}>
          Novo PIN
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Introduza o novo PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          value={novoPin}
          onChangeText={setNovoPin}
        />

        <Text style={styles.label}>
          Confirmar novo PIN
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Confirme o novo PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          value={confirmarPin}
          onChangeText={setConfirmarPin}
        />

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.7 }]}
          onPress={alterarPin}
          disabled={carregando}
        >

          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>
              ALTERAR PIN
            </Text>
          )}

        </TouchableOpacity>

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
    height: 180,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#D1FAE5',
    marginTop: 8,
  },

  formulario: {
    padding: 25,
    marginTop: 20,
  },

  tituloFormulario: {
    fontSize: 25,
    color: '#14532D',
    fontWeight: 'bold',
  },

  descricao: {
    color: '#64748B',
    marginTop: 10,
    marginBottom: 25,
  },

  label: {
    color: '#14532D',
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 20,
  },

  botao: {
    height: 55,
    backgroundColor: '#15803D',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

});

