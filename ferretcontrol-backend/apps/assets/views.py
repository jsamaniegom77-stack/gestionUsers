from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django.http import HttpResponse
from .models import InformationAsset
from .serializers import InformationAssetSerializer

class InformationAssetViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'head', 'put', 'patch']
    queryset = InformationAsset.objects.all().order_by("-created_at")
    serializer_class = InformationAssetSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "source", "tags", "description"]
    ordering_fields = ["created_at", "criticality", "classification"]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'])
    def download_authorship(self, request, pk=None):
        asset = self.get_object()
        content = f"""=== CERTIFICADO DE AUTORIA DE ACTIVO DE INFORMACION ===

ID: {asset.id}
Nombre: {asset.name}
Tipo: {asset.asset_type}
Clasificacion: {asset.classification}
Criticidad: {asset.criticality_display}

Propietario (Autor): {asset.owner.username if asset.owner else 'Desconocido'}
Fecha de Registro: {asset.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Descripcion:
{asset.description}

Generado por FerretControl System
"""
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="authorship_{asset.id}.txt"'
        return response
