import { Suspense } from 'react';
import MembershipView from './MembershipView';
import { getOffering } from '@epcc-sdk/sdks-shopper';
import {initializeShopperClient} from "@/lib/epcc-shopper-client";

initializeShopperClient()
const OFFERING_ID = '5bae1137-59c7-409a-87d6-72023fa22b17';

async function fetchOffering() {
  try {
    const response = await getOffering({
      path: {
        offering_uuid: OFFERING_ID
      },
      query: {
        include: ['plans', 'pricing_options', 'features']
      }
    });

    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch offering:', error);
    return null;
  }
}

export default async function MembershipPage() {
  const offering = await fetchOffering();

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <MembershipView offering={offering} />
    </Suspense>
  );
}