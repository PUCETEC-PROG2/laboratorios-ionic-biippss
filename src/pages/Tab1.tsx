import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  useIonViewWillEnter,
  IonText,
  IonAlert,
  IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Tab1.css';
import { Repository } from '../interfaces/Repository';
import RepoItem from '../components/RepoItem';
import { fetchRepositories, deleteRepository } from '../services/GitHubService';
import LoadingSpinner from '../components/LoadingSpinner';

const Tab1: React.FC = () => {
  const history = useHistory();
  const [repositoryList, setRepositoryList] = React.useState<Repository[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Estado para eliminación (DELETE)
  const [repoToDelete, setRepoToDelete] = React.useState<Repository | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

  // Feedback visual
  const [toastMsg, setToastMsg] = React.useState("");
  const [toastColor, setToastColor] = React.useState<'success' | 'danger'>('success');
  const [showToast, setShowToast] = React.useState(false);

  const notify = (message: string, color: 'success' | 'danger') => {
    setToastMsg(message);
    setToastColor(color);
    setShowToast(true);
  };

  const loadRepos = async () => {
    setLoading(true);
    setErrorMsg("");

    fetchRepositories()
      .then((reposData) => setRepositoryList(reposData))
      .catch((error) => {
        console.error(error);
        const apiError = error instanceof Error ? error.message : String(error);
        setErrorMsg(`Error al cargar repositorios: ${apiError}`);
      })
      .finally(() => setLoading(false));
  };

  useIonViewWillEnter(() => {
    loadRepos();
  });

  // --- Edición (PATCH) ---
  // Al hacer clic en editar, redirige al Tab2 llevando el repositorio
  // seleccionado en el "state" de la navegación. Tab2 detecta ese state
  // y cambia a modo "actualizar".
  const handleEditRequest = (repository: Repository) => {
    history.push('/tab2', { editRepo: repository });
  };

  // --- Eliminación (DELETE) ---
  const handleDeleteRequest = (repository: Repository) => {
    setRepoToDelete(repository);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = () => {
    if (!repoToDelete) return;
    const repo = repoToDelete;
    setRepoToDelete(null);
    deleteRepository(repo.owner.login, repo.name)
      .then(() => {
        setRepositoryList((prevList) => prevList.filter((r) => r.id !== repo.id));
        notify(`Repositorio "${repo.name}" eliminado`, 'success');
      })
      .catch((error) => {
        const apiError = error instanceof Error ? error.message : String(error);
        notify(`Error al eliminar el repositorio: ${apiError}`, 'danger');
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Repositorios</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Repositorios</IonTitle>
          </IonToolbar>
        </IonHeader>

        {loading && <LoadingSpinner />}

        {!loading && repositoryList.length > 0 && (
          <IonList>
            {repositoryList.map((repo) => (
              <RepoItem
                key={repo.id}
                {...repo}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
            ))}
          </IonList>
        )}

        {!loading && errorMsg && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <IonText color="danger">
              <p style={{ fontWeight: 'bold' }}>{errorMsg}</p>
            </IonText>
          </div>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          header="Eliminar repositorio"
          message={`¿Seguro que deseas eliminar "${repoToDelete?.name}"? Esta acción no se puede deshacer.`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setRepoToDelete(null)
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDeleteConfirm
            }
          ]}
          onDidDismiss={() => setShowDeleteAlert(false)}
        />

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={2500}
          color={toastColor}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
