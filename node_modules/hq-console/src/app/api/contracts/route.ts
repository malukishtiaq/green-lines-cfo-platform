import { NextRequest, NextResponse } from 'next/server';
import { RepositoryFactory } from '../../../infrastructure/database';
import { ServiceFactory } from '../../../application';
import { GenerateContractUseCase, SendContractUseCase } from '../../../application/use-cases';
import { AIContentService, PDFService, ContractEmailService } from '../../../infrastructure/services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      templateId,
      senderCompanyId,
      recipientEmail,
      recipientName,
      customerId,
      type,
      language,
      industry,
      variables,
      aiProvider,
      createdById,
      contractId,
    } = body;

    if (action === 'generate') {
      const useCase = new GenerateContractUseCase(
        RepositoryFactory.getContractRepository(),
        RepositoryFactory.getContractTemplateRepository(),
        RepositoryFactory.getCompanyProfileRepository(),
        new AIContentService(),
        new PDFService(),
      );

      const contract = await useCase.execute({
        templateId,
        senderCompanyId,
        recipientEmail,
        recipientName,
        customerId,
        type,
        language,
        industry,
        variables,
        aiProvider,
        createdById,
      });
      return NextResponse.json({ success: true, data: contract });
    }

    if (action === 'send') {
      const useCase = new SendContractUseCase(
        RepositoryFactory.getContractRepository(),
        new ContractEmailService()
      );
      const updated = await useCase.execute(contractId);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected error' }, { status: 500 });
  }
}

