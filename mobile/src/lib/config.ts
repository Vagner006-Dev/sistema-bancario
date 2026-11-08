import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Para apontar para outro servidor (por exemplo o VPS), escreve aqui o endereÃ§o
// completo, sem barra no fim. Exemplo: 'https://banco.exemplo.co.mz'
// Deixa vazio para usar o computador onde corre o Expo (desenvolvimento).
const CONTAS_MANUAL = '';
const TRANSACCOES_MANUAL = '';

// No desenvolvimento, o telemÃ³vel e o emulador chegam ao PC pelo mesmo endereÃ§o
// que o Expo usa para servir a app (ex.: 192.168.1.20:8081 -> 192.168.1.20).
function anfitriao(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const CONTAS_URL = CONTAS_MANUAL || `http://${anfitriao()}:8080`;
export const TRANSACCOES_URL = TRANSACCOES_MANUAL || `http://${anfitriao()}:8081`;



