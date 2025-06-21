import React, { useState, useEffect, useRef } from 'react';
// Nota: La importación de './index.css' no es necesaria aquí si ya se importa en main.jsx
// o si los estilos están incrustados directamente en public/index.html.

// Helper function to convert data to CSV and trigger download
const exportToCsv = (data) => {
  if (data.length === 0) {
    console.warn("No hay datos para exportar.");
    return false;
  }

  // Define CSV headers (encabezados de las columnas)
  const headers = ["VIN", "Matricula_Interna", "Fecha_Guardado"];
  // Mapea los datos a filas CSV
  const rows = data.map(item => [
    `"${item.vin}"`, // Envuelve con comillas para manejar comas o caracteres especiales dentro del VIN
    `"${(item.internalPlate || '').replace(/"/g, '""')}"`, // Maneja matrícula opcional y escapa comillas dobles
    `"${new Date(item.timestamp).toLocaleString().replace(/"/g, '""')}"` // Escapa comillas dobles en la fecha/hora
  ]);

  // Combina encabezados y filas para formar el contenido CSV
  const csvContent = [
    headers.join(","),
    ...rows.map(e => e.join(","))
  ].join("\n");

  // Crea un Blob (objeto binario) a partir del contenido CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); // Crea una URL temporal para el Blob

  // Crea un elemento 'a' (enlace) temporal para disparar la descarga
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `vin_data_${new Date().toISOString().slice(0, 10)}.csv`); // Nombre del archivo: vin_data_YYYY-MM-DD.csv
  document.body.appendChild(link); // Añade el enlace al DOM (necesario para Firefox)
  link.click(); // Simula un clic en el enlace para iniciar la descarga
  document.body.removeChild(link); // Limpia el enlace temporal del DOM
  URL.revokeObjectURL(url); // Libera el objeto URL
  return true; // Indica que la exportación se inició con éxito
};

// Helper function to get approximate localStorage size
const getLocalStorageSize = () => {
  let totalBytes = 0;
  try {
    // Itera sobre todas las claves en localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (key && value) {
        // Estima el tamaño en bytes. String.prototype.length cuenta unidades de código UTF-16,
        // que suelen ser de 1-2 bytes por carácter. Multiplicar por 2 es una estimación común.
        totalBytes += (key.length * 2) + (value.length * 2);
      }
    }
  } catch (e) {
    // Captura cualquier error al acceder a localStorage (ej. SecurityError en ciertos contextos)
    console.error("Error al calcular el tamaño de localStorage:", e);
    return "Error"; // Devuelve un mensaje de error si algo sale mal
  }

  // Convierte los bytes a KB o MB para una visualización más legible
  if (totalBytes < 1024) {
    return `${totalBytes} Bytes`;
  } else if (totalBytes < 1024 * 1024) {
    return `${(totalBytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

// Componente de la Pantalla Inicial (Splash Screen)
const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <svg className="splash-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l-2 2-2-2m5 0l2-2 2 2m-2-2v13M9 19h6a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2z" />
        </svg>
        <p className="splash-text">Cargando...</p>
      </div>
    </div>
  );
};

// Componente de la Pantalla Principal
const HomeScreen = ({ navigate }) => {
  const [exportMessage, setExportMessage] = useState('');

  const handleExportClick = () => {
    const currentData = JSON.parse(localStorage.getItem('vinData')) || [];
    const exported = exportToCsv(currentData);
    if (exported) {
      setExportMessage("Datos exportados correctamente.");
    } else {
      setExportMessage("No hay datos para exportar.");
    }
    setTimeout(() => setExportMessage(''), 3000);
  };

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="home-header-left">
          <svg className="home-logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.01 12.01 0 003 12c0 2.83 1.044 5.403 2.707 7.318A11.989 11.989 0 0012 22c4.36 0 8.056-2.585 9.923-6.194a12.007 12.007 0 001.066-1.536A11.955 11.955 0 0021 12a12.01 12.01 0 00-1.382-5.016z" />
          </svg>
          <h1 className="home-title">Dpto. Transporte</h1>
        </div>
        <button
          onClick={() => navigate('info')}
          className="menu-button"
          aria-label="Menú de información"
        >
          <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      <main className="home-main-content">
        <div className="home-center-area">
          {/* Aquí puedes añadir futuras funcionalidades o información relevante. */}
        </div>

        <button
          onClick={() => navigate('data')}
          className="action-button primary-button"
        >
          VER DATOS
        </button>

        <button
          onClick={handleExportClick}
          className="action-button secondary-button"
        >
          EXPORTAR CSV
        </button>
        {exportMessage && (
          <p className="export-message">{exportMessage}</p>
        )}
      </main>

      <footer className="home-footer">
        <button
          onClick={() => navigate('scanner')}
          className="scan-button"
          aria-label="Escanear VIN"
        >
          <svg className="scan-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="scan-button-text">ESCANEAR</span>
        </button>
      </footer>
    </div>
  );
};

// Componente de la Pantalla Informativa
const InfoScreen = ({ navigate }) => {
  const whatsappNumber = "549351XXXXXXX"; // Reemplaza con tu número de WhatsApp real

  return (
    <div className="info-screen">
      <header className="info-header">
        <button
          onClick={() => navigate('home')}
          className="back-button"
          aria-label="Volver a la pantalla principal"
        >
          <svg className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="info-title">Acerca de la App / Información</h1>
      </header>

      <main className="info-main-content custom-scrollbar">
        <p className="info-text">
          Esta aplicación tiene como objetivo principal la identificación y gestión de vehículos mediante el escaneo de su VIN (Número de Identificación Vehicular) y la asociación opcional con un Número de Matrícula Interna. Los datos se almacenan de forma segura en tu dispositivo.
        </p>
        <p className="info-text">
          Puedes escanear nuevos VINs, ingresarlos manualmente si es necesario, y visualizar y gestionar todos los registros guardados en la sección "DATOS". Además, tienes la opción de exportar tus datos a un archivo CSV para su uso en otras herramientas.
        </p>
        <p className="contact-heading">Contacto del Creador:</p>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          <svg className="whatsapp-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.52 3.46 1.5 4.96L2.05 22l5.25-1.38c1.47.8 3.16 1.22 4.74 1.22 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm3.32 14.53c-.15.24-.46.36-.78.36-.31 0-.61-.12-.76-.35l-1.37-2.02c-.22-.32-.57-.46-.94-.46-.37 0-.7.14-.92.46L8.06 14.07c-.15.24-.46.36-.78.36-.31 0-.61-.12-.76-.35-.22-.32-.35-.67-.35-1.04v-2.1c0-.37.13-.7.35-.92l.92-.92c.22-.22.55-.35.92-.35h.7c.37 0 .7.13.92.35l.92.92c.22.22.35.55.35.92v.7c0 .37-.13.7-.35.92l-.92.92c-.22.22-.55.35-.92.35h-.7c-.37 0-.7-.13-.92-.35l-1.37-2.02c-.15-.24-.46-.36-.78-.36-.31 0-.61-.12-.76-.35l-1.37-2.02c-.22-.32-.57-.46-.94-.46-.37 0-.7.14-.92.46L8.06 14.07c-.15.24-.46.36-.78.36-.31 0-.61-.12-.76-.35-.22-.32-.35-.67-.35-1.04v-2.1c0-.37.13-.7.35-.92l.92-.92c.22-.22.55-.35.92-.35h.7c.37 0 .7.13.92.35l.92.92c.22.22.35.55.35.92v.7c0 .37-.13.7-.35.92l-.92.92c-.22.22-.55.35-.92.35h-.7c-.37 0-.7-.13-.92-.35l-1.37-2.02c-.15-.24-.46-.36-.78-.36-.31 0-.61-.12-.76-.35l-1.37-2.02c-.22-.32-.57-.46-.94-.46-.37 0-.7.14-.92.46z" />
          </svg>
          Contactar por WhatsApp
        </a>
      </main>
    </div>
  );
};

// Componente de la Pantalla de Escáner (con funcionalidad real de ZXing)
const ScannerScreen = ({ navigate }) => {
  const [message, setMessage] = useState("Iniciando cámara...");
  const videoRef = useRef(null); // Referencia al elemento <video> para el stream de la cámara
  const codeReaderRef = useRef(null); // Referencia para el objeto ZXing CodeReader

  useEffect(() => {
    // Verificar si ZXing está disponible antes de usarlo
    if (typeof window.ZXing === 'undefined') {
      setMessage("Error: La librería de escaneo no está cargada. Por favor, asegúrate de añadir el script de ZXing en public/index.html.");
      return;
    }

    const startScanning = async () => {
      try {
        setMessage("Solicitando acceso a la cámara...");
        // Crear una instancia de ZXing para códigos de barras (1D)
        // Usamos BarcodeFormat.CODE_128 como ejemplo, pero VINs suelen ser Code 39, Code 128 o VIN specific
        // Para VINs reales, es posible que necesitemos un lector más específico o configuraciones adicionales
        const formats = [
          window.ZXing.BarcodeFormat.CODE_39,
          window.ZXing.BarcodeFormat.CODE_93,
          window.ZXing.BarcodeFormat.CODE_128,
          // Puedes añadir más formatos si son relevantes para VINs
        ];
        const hints = new Map();
        hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);

        codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader(hints);

        // Obtener el stream de la cámara trasera
        const videoInputDevices = await window.ZXing.BrowserCodeReader.listVideoInputDevices();
        const rearCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
        const deviceId = rearCamera ? rearCamera.deviceId : undefined; // Usar la cámara trasera si se encuentra

        if (videoRef.current) {
          setMessage("Cámara activada. Enfoca el VIN para escanear...");
          // Iniciar el lector de código de barras
          codeReaderRef.current.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
            if (result) {
              const vinDetectado = result.getText();
              setMessage(`VIN detectado: ${vinDetectado}`);
              // Detener el escaneo una vez que se detecta un VIN
              codeReaderRef.current.reset();
              // Navegar al formulario con el VIN escaneado
              setTimeout(() => {
                navigate('form', { vin: vinDetectado, isManual: false });
              }, 1000);
            }
            if (err && !(err instanceof window.ZXing.NotFoundException)) {
              console.error("Error de escaneo:", err);
              setMessage("Error al escanear. Intenta de nuevo.");
            }
          });
        }
      } catch (err) {
        console.error("Error al iniciar el escáner:", err);
        setMessage("Error: No se pudo iniciar la cámara o el escáner. Asegúrate de otorgar permisos.");
      }
    };

    startScanning();

    // Función de limpieza al desmontar el componente
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset(); // Detiene el escáner y la cámara
      }
    };
  }, [navigate]); // Dependencia: navigate para asegurar que el efecto se ejecuta solo si navigate cambia

  // Función simulada para un VIN escaneado (para pruebas rápidas sin cámara)
  const simulateScan = () => {
    const dummyVin = "VIN_SIMULADO_ABC123DEF456";
    setMessage(`VIN simulado: ${dummyVin}`);
    setTimeout(() => {
      navigate('form', { vin: dummyVin, isManual: false });
    }, 1000);
  };

  return (
    <div className="scanner-screen">
      <header className="scanner-header">
        <button
          onClick={() => navigate('home')}
          className="back-button"
          aria-label="Volver a la pantalla principal"
        >
          <svg className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="scanner-title">Escáner de VIN</h1>
        <div className="empty-space"></div>
      </header>

      <main className="scanner-main-content">
        <video ref={videoRef} className="video-stream"></video>
        <div className="scanner-status-message">
          {message}
        </div>
      </main>

      <footer className="scanner-footer">
        <button
          onClick={() => navigate('form', { vin: '', isManual: true })}
          className="scanner-button manual-input-button"
        >
          Ingresar Manualmente
        </button>
        <button
          onClick={simulateScan}
          className="scanner-button simulate-scan-button"
        >
          Simular Escaneo
        </button>
      </footer>
    </div>
  );
};

// Componente de la Pantalla de Formulario
const FormScreen = ({ navigate, vin: initialVin = '', isManual: initialIsManual = false }) => {
  const [vin, setVin] = useState(initialVin);
  const [internalPlate, setInternalPlate] = useState('');
  const [message, setMessage] = useState('');
  const [isManual, setIsManual] = useState(initialIsManual);

  const handleSave = () => {
    if (!vin) {
      setMessage("El campo VIN no puede estar vacío.");
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    try {
      const currentData = JSON.parse(localStorage.getItem('vinData')) || [];
      const newData = [...currentData, { vin, internalPlate, timestamp: new Date().toISOString() }];
      localStorage.setItem('vinData', JSON.stringify(newData));

      setMessage("Datos Guardados!");
      setTimeout(() => {
        setMessage('');
        navigate('scanner');
      }, 1500);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        setMessage("Error: Memoria de almacenamiento llena. Por favor, exporta y borra datos desde la sección 'Datos'.");
      } else {
        setMessage("Error al guardar los datos.");
      }
      setTimeout(() => setMessage(''), 5000);
      console.error("Error al guardar en localStorage:", e);
    }
  };

  return (
    <div className="form-screen">
      <header className="form-header">
        <button
          onClick={() => navigate('scanner')}
          className="back-button"
          aria-label="Volver a la pantalla de escáner"
        >
          <svg className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="form-title">Formulario de Datos</h1>
      </header>

      <main className="form-main-content">
        <div className="form-group">
          <label htmlFor="vin" className="form-label">VIN Escaneado:</label>
          <input
            type="text"
            id="vin"
            className={`form-input ${isManual ? 'editable-input' : 'read-only-input'}`}
            value={vin}
            onChange={(e) => isManual && setVin(e.target.value)}
            readOnly={!isManual}
            placeholder="Ingrese el VIN o escanee"
          />
        </div>
        <div className="form-group">
          <label htmlFor="internalPlate" className="form-label">Número de Matrícula Interna (Opcional):</label>
          <input
            type="text"
            id="internalPlate"
            className="form-input"
            value={internalPlate}
            onChange={(e) => setInternalPlate(e.target.value)}
            maxLength="25"
            placeholder="Ingrese la matrícula interna"
          />
        </div>

        {message && (
          <div className={`form-message ${message.includes("Error") ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          className="action-button save-button"
        >
          GUARDAR DATOS
        </button>
      </main>
    </div>
  );
};

// Componente de la Pantalla de Datos
const DataScreen = ({ navigate }) => {
  const [vinData, setVinData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [localStorageUsage, setLocalStorageUsage] = useState('');

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('vinData')) || [];
    setVinData(storedData);
    setLocalStorageUsage(getLocalStorageSize());
  }, []);

  const handleCheckboxChange = (index) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleDeleteSelected = () => {
    setConfirmAction('selected');
    setShowConfirmModal(true);
  };

  const handleDeleteAll = () => {
    setConfirmAction('all');
    setShowConfirmModal(true);
  };

  const handleExportAndClearAll = () => {
    if (vinData.length === 0) {
      setConfirmAction('noData');
      setShowConfirmModal(true);
      return;
    }
    setConfirmAction('exportAndClear');
    setShowConfirmModal(true);
  };

  const confirmActionExecute = () => {
    let updatedData = [...vinData];
    let dataCleared = false;

    if (confirmAction === 'selected') {
      updatedData = vinData.filter((_, index) => !selectedItems[index]);
      localStorage.setItem('vinData', JSON.stringify(updatedData));
      dataCleared = true;
    } else if (confirmAction === 'all') {
      updatedData = [];
      localStorage.removeItem('vinData');
      dataCleared = true;
    } else if (confirmAction === 'exportAndClear') {
      const exported = exportToCsv(vinData);
      if (exported) {
        localStorage.removeItem('vinData');
        updatedData = [];
        dataCleared = true;
      } else {
        dataCleared = false;
      }
    }

    if (dataCleared) {
      setVinData(updatedData);
      setSelectedItems({});
      setLocalStorageUsage(getLocalStorageSize());
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getConfirmMessage = () => {
    switch (confirmAction) {
      case 'selected':
        return "¿Estás seguro de que quieres borrar los elementos seleccionados? Esta acción es irreversible.";
      case 'all':
        return "¿Estás seguro de que quieres borrar TODOS los datos guardados? Esta acción es irreversible.";
      case 'exportAndClear':
        return "¿Estás seguro de que quieres EXPORTAR TODOS los datos y luego LIMPIAR la memoria de la aplicación? Esto borrará todos los registros del dispositivo.";
      case 'noData':
        return "No hay datos para exportar y limpiar.";
      default:
        return "¿Estás seguro?";
    }
  };

  return (
    <div className="data-screen">
      <header className="data-header">
        <button
          onClick={() => navigate('home')}
          className="back-button"
          aria-label="Volver a la pantalla principal"
        >
          <svg className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="data-title">Datos Guardados</h1>
      </header>

      <main className="data-main-content">
        <div className="storage-usage-info">
          Uso de Almacenamiento: {localStorageUsage}
        </div>

        {vinData.length === 0 ? (
          <p className="no-data-message">No hay datos guardados aún.</p>
        ) : (
          <ul className="data-list custom-scrollbar">
            {vinData.map((item, index) => (
              <li key={index} className="data-list-item">
                <input
                  type="checkbox"
                  checked={!!selectedItems[index]}
                  onChange={() => handleCheckboxChange(index)}
                  className="data-checkbox"
                />
                <div className="data-item-details">
                  <p className="data-item-vin">VIN: <span>{item.vin}</span></p>
                  {item.internalPlate && (
                    <p className="data-item-plate">Matrícula Interna: <span>{item.internalPlate}</span></p>
                  )}
                  <p className="data-item-timestamp">Guardado: {new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {vinData.length > 0 && (
          <footer className="data-footer-buttons">
            <div className="data-action-group">
              <button
                onClick={handleDeleteSelected}
                disabled={Object.values(selectedItems).every(val => !val)}
                className="action-button delete-selected-button"
              >
                Borrar Seleccionados
              </button>
              <button
                onClick={handleDeleteAll}
                className="action-button delete-all-button"
              >
                Borrar Todos
              </button>
            </div>
            <button
              onClick={handleExportAndClearAll}
              className="action-button export-clear-button"
            >
              EXPORTAR TODO Y LIMPIAR
            </button>
          </footer>
        )}
      </main>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">
              {getConfirmMessage()}
            </p>
            {confirmAction !== 'noData' && (
              <div className="modal-buttons">
                <button
                  onClick={confirmActionExecute}
                  className="modal-confirm-button"
                >
                  Confirmar
                </button>
                <button
                  onClick={cancelAction}
                  className="modal-cancel-button"
                >
                  Cancelar
                </button>
              </div>
            )}
            {confirmAction === 'noData' && (
              <div className="modal-buttons">
                <button
                  onClick={cancelAction}
                  className="modal-cancel-button"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// Componente principal de la aplicación
function App() {
  const [currentPage, setCurrentPage] = useState('splash');

  const navigate = (page, params = {}) => {
    if (page === 'form') {
      setCurrentPage({ name: 'form', vin: params.vin, isManual: params.isManual });
    } else {
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    const pageName = typeof currentPage === 'object' ? currentPage.name : currentPage;
    const pageParams = typeof currentPage === 'object' ? currentPage : {};

    switch (pageName) {
      case 'splash':
        return <SplashScreen onFinish={() => navigate('home')} />;
      case 'home':
        return <HomeScreen navigate={navigate} />;
      case 'info':
        return <InfoScreen navigate={navigate} />;
      case 'scanner':
        return <ScannerScreen navigate={navigate} />;
      case 'form':
        return <FormScreen navigate={navigate} vin={pageParams.vin} isManual={pageParams.isManual} />;
      case 'data':
        return <DataScreen navigate={navigate} />;
      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  return (
    <div className="app-container-global">
      {renderPage()}
    </div>
  );
}

// Exporta el componente App como predeterminado
export default App;
