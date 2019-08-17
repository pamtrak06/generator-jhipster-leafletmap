import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService } from 'ng-jhipster';
import { icon, latLng, marker, point, polyline, tileLayer } from 'leaflet';
import { Map } from './map.model';

import { AccountService } from 'app/core';

import { ITEMS_PER_PAGE } from 'app/shared';
import { MapService } from './map.service';

@Component({
    selector: 'jhi-map',
    templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, OnDestroy {

    currentAccount: any;
    eventSubscriber: Subscription;
    routeData: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;

    // Define our base layers so we can reference them multiple times
    OSMaps = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 20,
        detectRetina: true
    });

    // Marker center of France
    center = marker([46.4547, 2.2529], {
        icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: require('../../../../../../node_modules/leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('../../../../../../node_modules/leaflet/dist/images/marker-shadow.png')
        })
    });

    // Tétras Lyre Triangle trace

    trace = polyline([
        [45.016988, 5.860209],
        [44.929941, -0.423671],
        [49.711282, 2.421459],
        [45.016988, 5.860209]
    ]);

    // Layers
    layersControl = {
        baseLayers: {
            'OS Maps': this.OSMaps,
        },
        overlays: {
            'France': this.center,
            'Triangle': this.trace
        }
    };

    // Set the initial set
    options = {
        layers: [this.OSMaps, this.trace, this.center],
        zoom: 4,
        center: latLng([46.4547, 2.2529])
    };
    constructor(
        protected mapService: MapService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected parseLinks: JhiParseLinks,
        protected activatedRoute: ActivatedRoute,
        protected accountService: AccountService
    ) {
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.page = 0;
    this.links = {
      last: 0
    };
    this.predicate = 'id';
    this.reverse = true;
    this.activatedRoute.snapshot && this.activatedRoute.snapshot.params['search'] ? this.activatedRoute.snapshot.params['search'] : '';
  }

  loadAll() {
  }

  reset() {
    this.page = 0;
    this.loadAll();
  }

  loadPage(page) {
    this.page = page;
    this.loadAll();
  }

  clear() {
    this.links = {
      last: 0
    };
    this.page = 0;
    this.predicate = 'id';
    this.reverse = true;
    this.loadAll();
  }

  search(query) {
    if (!query) {
      return this.clear();
    }
    this.links = {
      last: 0
    };
    this.page = 0;
    this.predicate = '_score';
    this.reverse = false;
    this.loadAll();
  }

  ngOnInit() {
    this.loadAll();
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
    this.registerChangeInMap();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  registerChangeInMap() {
    this.eventSubscriber = this.eventManager.subscribe('mapModification', response => this.reset());
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

}
