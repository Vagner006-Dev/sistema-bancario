import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { obterConta, mostrarErro, type Conta } from '../lib/api';
import { sessao, limparSessao, useExigirSessao } from '../lib/sessao';
import { formatarMT } from '../lib/formato';

export default function DashboardScreen() {

  useExigirSessao();

  const [conta, setConta] = useState<Conta | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!sessao.token) return;

    let activo = true;
    obterConta()
      .then((c) => { if (activo) setConta(c); })
      .catch((e) => { if (activo) mostrarErro(e, 'Não foi possível carregar a conta'); })
      .finally(() => { if (activo) setCarregando(false); });

    return () => { activo = false; };
  }, []);

  function terminarSessao() {
    limparSessao();
    router.replace('/');
  }

  const titular = conta?.cliente?.nome ? `Titular: ${conta.cliente.nome}` : '';
  const aviso = conta && conta.estado !== 'ACTIVA' ? 'Conta bloqueada. Contacte o banco.' : '';
  const info = [titular, aviso].filter(Boolean).join('\n');

  return (

    <View style={styles.container}>

      <StatusBar background-Color="#14532D" barStyle="light-content" />

      <View style={styles.header}>

        <Text style={styles.logo}>BancoMobile</Text>

        <Text style={styles.subtitulo}>Bem-vindo ao seu banco</Text>

      </View>

      <View style={styles.conteudo}>

        <Text style={styles.titulo}>Área do Cliente</Text>

        <View style={styles.cartao}>

          <Text style={styles.textoCartao}>
            {sessao.numero ? `Conta ${sessao.numero}` : 'Conta'}
          </Text>

          {carregando ? (
            <ActivityIndicator color="#15803D" />
          ) : (
            <Text style={styles.saldo}>
              {conta ? formatarMT(conta.saldo) : 'Indisponível'}
            </Text>
          )}

          <Text style={styles.info}>
            {conta ? info : 'Não foi possível obter o saldo.'}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.push('/transferencia')}
        >
          <Text style={styles.textoBotao}>TRANSFERÊNCIAS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => router.push('/extracto')}
        >
          <Text style={styles.textoSecundario}>EXTRACTO BANCÁRIO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logout}
          onPress={terminarSessao}
        >
          <Text style={styles.textoLogout}>TERMINAR SESSÃO</Text>
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
    height: 160,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#D1FAE5',
    marginTop: 8,
  },

  conteudo: {
    padding: 22,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14532D',
    marginBottom: 20,
  },

  cartao: {
    backgroundColor: '#14532D',
    padding: 22,
    borderRadius: 15,
    marginBottom: 25,
  },

  textoCartao: {
    color: '#D1FAE5',
    fontSize: 14,
  },

  saldo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
  },

  info: {
    color: '#D1FAE5',
    marginTop: 8,
  },

  botao: {
    backgroundColor: '#15803D',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  botaoSecundario: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#15803D',
  },

  textoSecundario: {
    color: '#15803D',
    fontWeight: 'bold',
  },

  logout: {
    marginTop: 25,
    alignItems: 'center',
  },

  textoLogout: {
    color: '#DC2626',
    fontWeight: 'bold',
  },

});